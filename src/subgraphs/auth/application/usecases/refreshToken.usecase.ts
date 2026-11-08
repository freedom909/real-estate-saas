// src/subgraphs/auth/application/usecases/refreshToken.usecase.ts


import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import { inject, injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  REFRESH_TOKEN_TTL_SECONDS,
  SessionService,
  TokenPair,
} from "../../infrastructure/services/session.service";
import RedisRefreshTokenRepo from "../../infrastructure/repos/refresh-token.redis.repo";

interface RefreshTokenPayload {
  sub: string;
  sessionId: string;
  jti: string;
  type: string;
  role?: string;
  email?: string;
}

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TOKENS_AUTH.services.sessionService)
    private sessionService: SessionService,

    @inject(TOKENS_AUTH.repos.refreshTokenRepo)
    private refreshTokenRepo: RedisRefreshTokenRepo
  ) {}

  async execute(cmd: { refreshToken: string }): Promise<TokenPair> {
    const { refreshToken } = cmd;

    // 1. Verify JWT.
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }

    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(refreshToken, secret, {
        algorithms: ["HS256"],
      }) as RefreshTokenPayload;
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    if (
      !payload ||
      payload.type !== "refresh" ||
      !payload.sub ||
      !payload.sessionId ||
      !payload.jti
    ) {
      throw new Error("Invalid refresh token");
    }

    // 2. Redis pre-check. Do not consume the token yet.
    const meta = await this.refreshTokenRepo.get(refreshToken);

    if (
      !meta.userId ||
      !meta.sessionId ||
      !meta.deviceId ||
      meta.userId !== payload.sub ||
      meta.sessionId !== payload.sessionId
    ) {
      throw new Error("Refresh token already used or revoked");
    }

    // 3. MongoDB atomic CAS.
    const newRefreshTokenId = uuidv4();

    const rotated = await this.sessionService.rotateRefreshTokenId({
      sessionId: payload.sessionId,
      userId: payload.sub,
      oldRefreshTokenId: payload.jti,
      newRefreshTokenId,
    });

    if (!rotated) {
      throw new Error("Session revoked or token already rotated");
    }

    // 4–6. After CAS succeeds, every subsequent failure
    // must fail closed by revoking the session.
    try {
      // 4. Atomically consume the old Redis token.
      const consumed = await this.refreshTokenRepo.consume(refreshToken);

      if (
        !consumed ||
        consumed.userId !== payload.sub ||
        consumed.sessionId !== payload.sessionId ||
        consumed.deviceId !== meta.deviceId
      ) {
        throw new Error(
          "Refresh token could not be consumed after rotation"
        );
      }

      // 5. Issue the new token pair.
      const tokens = this.sessionService.issueTokenPair({
        userId: payload.sub,
        sessionId: payload.sessionId,
        refreshTokenId: newRefreshTokenId,
        role: payload.role,
        email: payload.email,
      });

      // 6. Persist the new refresh token.
      await this.refreshTokenRepo.save({
        userId: payload.sub,
        token: tokens.refreshToken,
        sessionId: payload.sessionId,
        deviceId: meta.deviceId,
        ttl: REFRESH_TOKEN_TTL_SECONDS,
        issuedAt: new Date(),
      });

      return tokens;
    } catch (error) {
      // Mongo CAS has already succeeded.
      // Revoke the session to prevent inconsistent token state.
      try {
        await this.sessionService.revokeSession(payload.sessionId);
      } catch (revokeError) {
        console.error(
          "[RefreshTokenUseCase] Failed to revoke session after rotation failure:",
          revokeError
        );
      }

      throw error;
    }
  }
}
