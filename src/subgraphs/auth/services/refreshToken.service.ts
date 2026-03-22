// src/subgraphs/auth/services/refresh/refreshToken.service.ts


import { TokenService } from "./token.service";
import { RefreshToken } from "../models/refreshToken.model";
import { inject, injectable } from "tsyringe";
import SessionRepository from "../repos/session.repo";
import UserClient from "../adapters/user.client";
import { hash } from "../../../infrastructure/utils/hash";

interface RefreshTokenRepo {
  revokeFamily(familyId: string): Promise<void>;
  findByJti(jti: string): Promise<any>;
  markAsUsed(jti: string, usedAt: Date): Promise<void>;
  consume(token: string): Promise<any>;
  save(token: string, meta: RefreshToken & { jti: string; expiresAt: Date }): Promise<void>;
  revokeBySession(sessionId: string): Promise<void>;
  revokeAllByUser(userId: string): Promise<void>;
}

export interface User {
  id: string
  email: string

}

interface UserRepo {
  getTokenVersion(userId: string): Promise<number>;
}

interface LoginRiskService {
  handleRefreshTokenReuse(data: any): Promise<void>;
}

interface RefreshContext {
  deviceId?: string;
  ip?: string;
  userAgent?: string;
}

@injectable()
export default class RefreshTokenService {
  constructor(
    @inject("TokenService")
    private tokenService: TokenService,
    @inject("RefreshTokenRepo")
    private refreshTokenRepo: RefreshTokenRepo,
    @inject("SessionRepository")
    private sessionRepo: SessionRepository,
    @inject("LoginRiskService")
    private riskService: LoginRiskService
  ) {}

async revokeAll(userId: string) {
  await this.refreshTokenRepo.revokeAllByUser(userId);
}

 async refresh(refreshToken: string, ctx: RefreshContext={}) {
  // 1. verify
  const payload = await this.tokenService.verifyRefreshToken(refreshToken);
  const { sub, jti, sessionId, familyId } = payload;

  // 2. consume（原子）
  const consumed = await this.refreshTokenRepo.consume(jti);

  if (!consumed) {
    // 🚨 reuse attack
    await this.refreshTokenRepo.revokeFamily(familyId);

    await this.riskService.handleRefreshTokenReuse({
      userId: sub,
      sessionId,
      familyId,
      reusedJti: jti
    });

    throw new Error("Refresh token reuse detected");
  }
  const deviceId= ctx.deviceId??null;

  
  // 3. issue new token（新节点）
  const pair = await this.tokenService.issueAndPersistTokenPair({
    userId: sub,
    sessionId,
    familyId,
    deviceId,

    // 👇 关键
    rotatedFrom: jti
  });

  return pair;
}
}