// src/subgraphs/auth/services/refresh/refreshToken.service.ts


import { TokenService } from "./token.service";
import { RefreshToken } from "../models/refreshToken.model";
import { inject, injectable } from "tsyringe";
import SessionRepository from "../repos/session.repo";
import UserClient from "../adapters/user.client";
import { hash } from "../../../infrastructure/utils/hash";
import { TOKENS_AUTH } from "@/modules/auth/container/auth.tokens";
import { TOKENS_SECURITY } from "@/security/container/tokens";
import { RiskEngine } from "@/security/domain/risk.engine";
import { RiskEventRepo } from "../repos/risk.event.repo";

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
    @inject(TOKENS_AUTH.services.tokenService)
    private tokenService: TokenService,
    @inject(TOKENS_AUTH.repos.refreshTokenRepo)
    private refreshTokenRepo: RefreshTokenRepo,
    @inject(TOKENS_AUTH.repos.sessionRepo)
    private sessionRepo: SessionRepository,
    @inject(TOKENS_AUTH.repos.riskEventRepo)
    private riskEventRepo: RiskEventRepo
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

    await this.riskEventRepo.handleRefreshTokenReuse({
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