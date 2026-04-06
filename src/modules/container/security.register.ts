import "reflect-metadata";
import { container } from "tsyringe";
import { TOKENS_SECURITY } from "../tokens/security.tokens";
import { RiskEngine } from "../../security/domain/risk.engine";
import { DecisionEngine } from "../../security/domain/decision.engine";
import { EvaluateRiskUseCase } from "../../security/application/evaluateRisk.usecase";
import { AuditRepo } from "../../security/infrastructure/audit.repo";
import { MockAIService } from "../../security/infrastructure/ai.service";


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