//security/application/evaluateRisk.usecase.ts
import { inject, injectable } from "tsyringe";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { IAuditRepo, RiskResult, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";
import { ITrustedDeviceRepo } from "../domain/repos/ITrustedDeviceRepo";


@injectable()
export class EvaluateRiskUseCase {
  constructor(
    @inject(TOKENS_SECURITY.riskEngine)
    private engine: RiskEngine,

    @inject(TOKENS_SECURITY.decisionEngine)
    private decision: DecisionEngine,

    @inject(TOKENS_SECURITY.trustedDeviceRepo)
    private trustedDeviceRepo: ITrustedDeviceRepo,

    @inject(TOKENS_SECURITY.auditRepo)
    private audit: IAuditRepo
  ) {}

  async execute(event: SecurityEvent): Promise<RiskResult> {
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

    const score = await this.engine.evaluate({
      ...event,
      context: ctx
    });

    const decision = this.decision.decide(score, ctx);

    const result = { score, decision };

    await this.audit.save({
      ...event,
      ...result,
      timestamp: new Date()
    });

    return result;
  }
}

export default EvaluateRiskUseCase;
