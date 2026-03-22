import { injectable, inject } from "tsyringe";
import SessionRepository from "../repos/session.repo";
import { TOKENS_AUTH } from "../../../modules/auth/container/auth.tokens";
import { createHash } from "crypto";

interface CreateSessionParams {
  userId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  refreshTokenId: string;
  familyId: string;
  lastSeenAt?: Date;
}

@injectable()
export default class SessionService {
  constructor(
    @inject(TOKENS_AUTH.repos.sessionRepo) private sessionRepo: SessionRepository
  ) {}

  async createSession(params: CreateSessionParams) {
    return this.sessionRepo.create({
      userId: params.userId,
      deviceId: params.deviceId,
      ipHash: this.hash(params.ip),
      userAgentHash: this.hash(params.userAgent),
      refreshTokenId: params.refreshTokenId,
      familyId: params.familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  async findBySessionId(sessionId: string) {
    return this.sessionRepo.findById(sessionId);
  }

  async updateRefreshTokenId(sessionId: string, newJti: string) {
    return this.sessionRepo.update(sessionId, {
      refreshTokenId: newJti,
      lastSeenAt: new Date()//
    });
  }

  async revokeSession(sessionId: string) {
    return this.sessionRepo.revoke(sessionId);
  }

  async revokeFamily(familyId: string) {
    // Assuming repository has a method to revoke by familyId
    // If not, this logic might need to be moved to repo, but here is the service layer intent
    return this.sessionRepo.deleteMany({ familyId });
  }

  private hash(value: string): string {
    if (!value) return "";
    return createHash("sha256").update(value).digest("hex");
  }

  
}
