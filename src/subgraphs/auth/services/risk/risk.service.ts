import { injectable, inject } from "tsyringe";
import mongoose from "mongoose";
import { TOKENS_AUTH } from "../../../../modules/auth/container/auth.tokens";
import { RiskEventRepo } from "../../repos/riskEvent.repo";
import { createHash } from "crypto";

interface RiskEventParams {
  type: "LOGIN_SUCCESS" | "LOGIN_FAILED" | "TOKEN_REUSE";
  userId: string;
  ip: string; // Raw input
  userAgent: string; // Raw input
  deviceId: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  metadata?: any;
  
}

@injectable()
export default class RiskService {
  constructor(
    @inject(TOKENS_AUTH.repos.riskEventRepo) private repo: RiskEventRepo
  ) {}

  async record(params: RiskEventParams) {
    const ipHash = this.hash(params.ip);
    const userAgentHash = this.hash(params.userAgent);

    await this.repo.create({
      userId: new mongoose.Types.ObjectId(params.userId),
      eventData: {
        type: params.type,
        metadata: params.metadata,
      },
      ip:params.ip,
      userAgent:params.userAgent,
      deviceId: params.deviceId,
      severity: params.severity,
      createdAt: new Date(),
    });
  }

  private hash(value: string): string {
    if (!value) return "";
    return createHash("sha256").update(value).digest("hex");
  }
}
