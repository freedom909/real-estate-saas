// src/subgraphs/auth/infrastructure/services/session.service.ts

import { injectable, inject } from "tsyringe";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import {
  ActiveSession,
  ISessionPort,
} from "../../domain/ports/session.port";

import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import SessionRepository from "../repos/session.repo";
import RedisRefreshTokenRepo from "../repos/refresh-token.redis.repo";

/** Mirrors the refresh JWT lifetime ("7d") so Redis drops the entry together with the token. */
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@injectable()
export class SessionService implements ISessionPort {
  constructor(
    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository,

    @inject(TOKENS_AUTH.repos.refreshTokenRepo)
    private refreshTokenRepo: RedisRefreshTokenRepo
  ) {}

  /**
   * Create a new session during login.
   * Persists the session in MongoDB AND the refresh token in Redis,
   * so the token is single-use from the very first moment.
   */
  async createSession(input: {
    userId: string;
    role?: string | null;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null;
  }): Promise<TokenPair> {
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshTokenId = uuidv4();

    const tokens = this.issueTokenPair({
      userId: input.userId,
      sessionId,
      refreshTokenId,
      role: input.role,
      email: input.email,
    });

    const hash = (value?: string | null) =>
      value
        ? crypto.createHash("sha256").update(value).digest("hex")
        : undefined;

    await this.sessionRepo.create({
      id: sessionId,
      userId: input.userId,
      deviceId: input.deviceId || "unknown",
      familyId,
      refreshTokenId,
      ipHash: hash(input.ip),
      userAgentHash: hash(input.userAgent),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      activeTenantId: null,
      status: "ACTIVE",
      revoked: false,
    });

    await this.refreshTokenRepo.save({
      userId: input.userId,
      token: tokens.refreshToken,
      sessionId,
      deviceId: input.deviceId || "unknown",
      ttl: REFRESH_TOKEN_TTL_SECONDS,
      issuedAt: new Date(),
    });

    return tokens;
  }

  /**
   * Sign an access/refresh token pair for an existing session.
   * Single signing implementation shared by login and refresh rotation.
   */
  issueTokenPair(input: {
    userId: string;
    sessionId: string;
    refreshTokenId: string;
    role?: string | null;
    email?: string | null;
  }): TokenPair {
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured");
    }

    const accessToken = jwt.sign(
      {
        sub: input.userId,
        sessionId: input.sessionId,
        type: "access",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      secret,
      { expiresIn: "1125m" }
    );

    const refreshToken = jwt.sign(
      {
        sub: input.userId,
        sessionId: input.sessionId,
        jti: input.refreshTokenId,
        type: "refresh",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      secret,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Update the active tenant of the current session.
   */
  async updateActiveTenant(
    userId: string,
    sessionId: string,
    tenantId: string
  ): Promise<void> {
    const result =
      await this.sessionRepo.updateActiveTenantForUser({
        userId,
        sessionId,
        tenantId,
      });

    if (!result) {
      throw new Error("Invalid or inactive session");
    }
  }

  /**
   * Find a valid session belonging to the specified user.
   */
  async findSessionById(
    sessionId: string,
    userId: string
  ): Promise<ActiveSession | null> {
    const session =
      await this.sessionRepo.findActiveBySessionId(
        sessionId,
        userId
      );

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      userId: session.userId,
      refreshTokenId: session.refreshTokenId,
      activeTenantId: session.activeTenantId ?? null,
    };
  }

  /**
   * Atomically rotate the refresh token ID (CAS on refreshTokenId).
   * Returns false when the old ID no longer matches — i.e. the token was
   * already rotated (replay) or the session is revoked/expired.
   */
  async rotateRefreshTokenId(input: {
    sessionId: string;
    userId: string;
    oldRefreshTokenId: string;
    newRefreshTokenId: string;
  }): Promise<boolean> {
    if (
      !input.oldRefreshTokenId ||
      !input.newRefreshTokenId ||
      input.oldRefreshTokenId === input.newRefreshTokenId
    ) {
      throw new Error("Invalid refresh token ID");
    }

    return this.sessionRepo.rotateRefreshTokenIdForUser(input);
  }

  /**
   * Revoke a session by its business session ID.
   */
  async revokeSession(sessionId: string): Promise<void> {
    const result = await this.sessionRepo.revokeById(sessionId);

    if (result.matchedCount === 0) {
      throw new Error("Session not found or already revoked");
    }
  }
}
