import "reflect-metadata";
import { container } from "tsyringe";
import { TOKENS_SECURITY } from "./tokens";
import { RiskEngine } from "../domain/risk.engine";
import { DecisionEngine } from "../domain/decision.engine";
import { EvaluateRiskUseCase } from "../application/evaluateRisk.usecase";
import { AuditRepo } from "../infrastructure/audit.repo";
import { MockAIService } from "../infrastructure/ai.service";


function registerSecurityDependencies() {

container.register(TOKENS_SECURITY.aiService, {
  useClass: MockAIService,
});

container.register(TOKENS_SECURITY.riskEngine, {
  useClass: RiskEngine,
});

container.register(TOKENS_SECURITY.decisionEngine, {
  useClass: DecisionEngine,
});

container.register(TOKENS_SECURITY.auditRepo, {
  useClass: AuditRepo,
});

container.register(TOKENS_SECURITY.evaluateRiskUseCase, {
  useClass: EvaluateRiskUseCase,
});
}
export default registerSecurityDependencies