import { inject, injectable } from "tsyringe";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { IAuditRepo, RiskResult, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";
import { ITrustedDeviceRepo } from "@/subgraphs/auth/repos/ITrustedDeviceRepo";

@injectable()
export class EvaluateRiskUseCase {
  constructor(
    @inject(TOKENS_SECURITY.riskEngine)
    private engine: RiskEngine,

    @inject(TOKENS_SECURITY.decisionEngine)
    private decision: DecisionEngine,

    @inject(TOKENS_SECURITY.auditRepo)
    private audit: IAuditRepo,

    @inject(TOKENS_SECURITY.trustedDeviceRepo)
    private trustedDeviceRepo: ITrustedDeviceRepo
  ) { }

  async execute(event: SecurityEvent): Promise<RiskResult> {
    // ✅ 1. 查 trusted device（提前！！）
    const trusted = await this.trustedDeviceRepo.find(
      event.userId,
      event.deviceId
    );

    // ✅ 2. 构建 context（唯一来源）
    const ctx = {
      isTrustedDevice: !!trusted,
      isNewDevice: !trusted,
      ipRisk: false,
      failedAttempts: 0
    };

    // ✅ 3. 评分（带 context）
    const score = await this.engine.evaluate({
      ...event,
      context: ctx
    });

    // ✅ 4. 决策（用 ctx，不要 event.context）
    const decision = this.decision.decide(score, ctx);

    const result: RiskResult = { score, decision };

    // ✅ 5. audit（可以保留原 event 或加 ctx）
    await this.audit.save({
      ...event,
      ...result,
      timestamp: new Date(),
    });

    return result;
  }
}

export default EvaluateRiskUseCase;
