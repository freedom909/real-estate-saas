//security/application/evaluateRisk.usecase.ts
import { inject, injectable } from "tsyringe";
import { createHash } from "crypto";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { IAuditRepo, RiskResult, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";
import { ITrustedDeviceRepo } from "../domain/repos/ITrustedDeviceRepo";
import { IAiRiskEngine } from "../domain/ai.risk.engine";

import { TOKENS_INFRA } from "@/modules/tokens/infra.tokens";
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
  console.log("========== RISK START ==========");
  console.log("[risk] event:", {
    userId: event.userId,
    ip: event.ip,
    userAgent: event.userAgent,
    deviceId: event.deviceId,
    failedAttempts: event.failedAttempts,
    isNewDevice: event.isNewDevice,
    ipRisk: event.ipRisk,
  });

  const cacheKey = this.buildCacheKey(event);
  console.log("[risk] cacheKey:", cacheKey);

  console.log("[risk] BEFORE redis.get");
  console.log("[risk] Redis status:", this.redis.status);
console.log("[risk] Redis connector:", {
  host: this.redis.options.host,
  port: this.redis.options.port,
});

console.log("[risk] BEFORE redis.get");

const cached = await Promise.race([
  this.redis.get(cacheKey),
  new Promise<null>((_, reject) =>
    setTimeout(
      () => reject(new Error("REDIS_GET_TIMEOUT")),
      5000
    )
  ),
]);

console.log("[risk] AFTER redis.get:", cached);
  console.log("[risk] AFTER redis.get:", cached);

  if (cached) {
    console.log("[risk] CACHE HIT");
    return JSON.parse(cached);
  }

  console.log("[risk] CACHE MISS");

  // 1 Trusted device
  console.log("[risk] BEFORE trustedDeviceRepo.find");

  const trusted = await this.trustedDeviceRepo.find(
    event.userId,
    event.deviceId
  );

  console.log("[risk] AFTER trustedDeviceRepo.find:", !!trusted);

  const ctx = {
    isTrustedDevice: !!trusted,
    isNewDevice: !trusted,
    ipRisk: false,
    failedAttempts: 0,
  };

  console.log("[risk] context:", ctx);

  // 2 Deterministic rule engine
  console.log("[risk] BEFORE engine.evaluate");

  let score = await this.engine.evaluate({
    ...event,
    context: ctx,
  });

  console.log("[risk] AFTER engine.evaluate");
  console.log("[risk] score:", score);

  // 3 AI
  const callAI = this.shouldCallAI(score, ctx);

  console.log("[risk] shouldCallAI:", callAI);

  if (callAI) {
    console.log("[risk] BEFORE aiEngine.evaluate");

    const aiResult = await this.aiEngine.evaluate({
      ...event,
      context: ctx,
    });

    console.log("[risk] AFTER aiEngine.evaluate");
    console.log("[risk] aiResult:", aiResult);

    score = Math.max(score, aiResult.score);

    console.log("[risk] final score after AI:", score);
  }

  // Decision
  console.log("[risk] BEFORE decision.decide");

  const decision = this.decision.decide(score, ctx);

  console.log("[risk] decision:", decision);

  const result = { score, decision };

  // Cache
  console.log("[risk] BEFORE redis.setex");

  await this.redis.setex(
    cacheKey,
    this.getTTL(decision),
    JSON.stringify(result)
  );

  console.log("[risk] AFTER redis.setex");

  console.log("========== RISK END ==========");

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
