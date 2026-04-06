import { inject, injectable } from "tsyringe";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { IAuditRepo, SecurityEvent } from "../types";
import { TOKENS_SECURITY } from "../../modules/tokens/security.tokens";

@injectable()
export class EvaluateRiskUseCase {
  constructor(
    @inject(TOKENS_SECURITY.riskEngine)
    private engine: RiskEngine,

    @inject(TOKENS_SECURITY.decisionEngine)
    private decision: DecisionEngine,

    @inject(TOKENS_SECURITY.auditRepo)
    private audit: IAuditRepo
  ) {}

  async execute(event: SecurityEvent) {
    const score = await this.engine.evaluate(event);
    const decision = this.decision.decide(score);
    const result = { score, decision };
    await this.audit.save({
      ...event,
      ...result,
      timestamp: new Date(),
    });

    return result;
  }
}