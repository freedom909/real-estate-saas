//security/application/evaluateRisk.usecase.ts
import { inject, injectable } from "tsyringe";
import { createHash } from "crypto";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { IAuditRepo, RiskResult, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";
import { ITrustedDeviceRepo } from "../domain/repos/ITrustedDeviceRepo";
import { IAiRiskEngine } from "../domain/ai.risk.engine";
import AIService from "@/subgraphs/ai/services/ai.service";
import { TOKENS_INFRA } from "@/infrastructure/infra.tokens";
import Redis from "ioredis";
import { TOKENS_AUTH } from "@/modules/tokens/auth.tokens";
import SessionPort from "@/subgraphs/auth/domain/ports/session.port";


@injectable()
export class EvaluateRiskUseCase {
  constructor(
    @inject(TOKENS_SECURITY.riskEngine)
    private engine: RiskEngine,

    @inject(TOKENS_SECURITY.decisionEngine)
    private decision: DecisionEngine,

    @inject(TOKENS_SECURITY.trustedDeviceRepo)
    private trustedDeviceRepo: ITrustedDeviceRepo,

    @inject(TOKENS_SECURITY.aiRiskEngine) // ⭐ 新增
    private aiEngine: IAiRiskEngine,

    @inject(TOKENS_INFRA.infra.redis)
    private redis: Redis,
    
    @inject(TOKENS_SECURITY.auditRepo)
    private audit: IAuditRepo,

    @inject(TOKENS_AUTH.ports.sessionPort)
    private sessionPort: SessionPort,
  ) {}

  async execute(event: SecurityEvent): Promise<RiskResult> {
    const cacheKey = this.buildCacheKey(event);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    //1️⃣ trusted device
    const trusted = await this.trustedDeviceRepo.find(
      event.userId,
      event.deviceId
    );

    const ctx = {
      isTrustedDevice: !!trusted,
      isNewDevice: !trusted,
      ipRisk: false,
      failedAttempts: 0
    };

    // 2️⃣ Calculate deterministic rule-based score
    let score = await this.engine.evaluate({
      ...event,
      context: ctx
    });

    // 🤖 3️⃣ AI Risk Assessment (Only called if rule score is ambiguous or device is untrusted)
    if (this.shouldCallAI(score, ctx)) {
      const aiResult = await this.aiEngine.evaluate({ ...event, context: ctx });
      score = Math.max(score, aiResult.score); // Strategy: use the highest risk detected
    }

    const decision = this.decision.decide(score, ctx);

    const result = { score, decision };

    // 💾 4️⃣ 写缓存
    await this.redis.setex(
      cacheKey,
      this.getTTL(decision),
      JSON.stringify(result)
    );

    return result;
  }

  private buildCacheKey(event: SecurityEvent) {
    const ipHash = createHash("md5")
      .update(event.ip || "")
      .digest("hex");

    return `risk:${event.userId}:${event.deviceId}:${ipHash}`;
  }

 private shouldCallAI(score: number, ctx: any) {
    // 👉 关键策略（省钱核心）
    if (ctx.isTrustedDevice && score < 30) return false;
    if (score < 40) return false;

    return true;
  }

  private getTTL(decision: string) {
    switch (decision) {
      case "ALLOW":
        return 600; // 10 min
      case "CHALLENGE":
        return 120;
      case "BLOCK":
        return 30;
      default:
        return 60;
    }
  }
}
export default EvaluateRiskUseCase;
