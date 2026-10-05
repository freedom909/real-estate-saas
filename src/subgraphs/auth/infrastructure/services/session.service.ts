// src/subgraphs/auth/infrastructure/services/session.service.ts

import { injectable, inject } from "tsyringe";
import { ISessionPort } from "../../domain/ports/session.port";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import SessionRepository from "../repos/session.repo";

import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

@injectable()
export class SessionService implements ISessionPort {
  constructor(
    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository
  ) {}

  async updateActiveTenant(
    sessionId: string,
    tenantId: string
  ): Promise<void> {
    const result = await this.sessionRepo.updateBySessionId(//Property 'updateBySessionId' does not exist on type 'SessionRepository'.
      sessionId,
      {
        activeTenantId: tenantId,
        status: "ACTIVE",
      }
    );

    if (!result) {
      throw new Error("Session not found");
    }
  }

  async createSession(input: {
    userId: string;
    role?: string | null;
    deviceId?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshTokenId = uuidv4();

    const accessToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        type: "access",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1125m" }
    );

    const refreshToken = jwt.sign(
      {
        sub: input.userId,
        sessionId,
        jti: refreshTokenId,
        type: "refresh",
        role: input.role || undefined,
        email: input.email || undefined,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      activeTenantId: null,
      status: "ACTIVE",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.sessionRepo.revokeById(sessionId);
  }

  async findSessionById(
    sessionId: string
  ): Promise<{ activeTenantId?: string | null } | null> {
    const session = await this.sessionRepo.findBySessionId(sessionId);

    if (!session) {
      return null;
    }

    return {
      activeTenantId: session.activeTenantId ?? null,
    };
  }
}