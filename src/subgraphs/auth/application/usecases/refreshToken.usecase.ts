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

  /**
   * Rotate a refresh token (single-use).
   *
   * Accepts ONLY the refresh token — every identity claim (userId,
   * sessionId, jti) is derived from the verified JWT, never from the
   * caller context. That keeps the flow correct for unauthenticated
   * clients (GraphQL marks refreshToken as authenticated: false) and
   * tenant-safe: rotation never touches Session.activeTenantId.
   */
  async execute(cmd: { refreshToken: string }): Promise<TokenPair> {
    const { refreshToken } = cmd;

    // ── 1. Self-verify the JWT (signature, expiry, type). ────────────
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }

    let payload: RefreshTokenPayload;
    try {
      payload = jwt.verify(refreshToken, secret) as RefreshTokenPayload;
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    if (
      payload.type !== "refresh" ||
      !payload.sub ||
      !payload.sessionId ||
      !payload.jti
    ) {
      throw new Error("Invalid refresh token");
    }

    // ── 2. Redis: atomic single-use consumption of the old token. ────
    //     null ⇒ already rotated/revoked (reuse) → reject.
    const meta = await this.refreshTokenRepo.consume(refreshToken);
    if (
      !meta ||
      meta.userId !== payload.sub ||
      meta.sessionId !== payload.sessionId
    ) {
      throw new Error("Refresh token already used or revoked");
    }

    // ── 3. MongoDB: atomic rotation (CAS on refreshTokenId). ─────────
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

    // ── 4. Issue the new pair, persist it in Redis. ──────────────────
    const tokens = this.sessionService.issueTokenPair({
      userId: payload.sub,
      sessionId: payload.sessionId,
      refreshTokenId: newRefreshTokenId,
      role: payload.role,
      email: payload.email,
    });

    await this.refreshTokenRepo.save({
      userId: payload.sub,
      token: tokens.refreshToken,
      sessionId: payload.sessionId,
      deviceId: meta.deviceId,
      ttl: REFRESH_TOKEN_TTL_SECONDS,
      issuedAt: new Date(),
    });

    return tokens;
  }
}
