import "reflect-metadata";
import { container } from "tsyringe";
import { TOKENS_SECURITY } from "../tokens/security.tokens";
import { RiskEngine } from "../../security/domain/risk.engine";
import { DecisionEngine } from "../../security/domain/decision.engine";
import { EvaluateRiskUseCase } from "../../security/application/evaluateRisk.usecase";
import { AuditRepo } from "../../security/infrastructure/audit.repo";
import { MockAIService } from "../../security/infrastructure/ai.service";
import TrustedDeviceRepository from "@/security/infrastructure/repos/trustedDevice.repo";
import { GeminiRiskEngine } from "@/security/infrastructure/ai/gemini.risk.engine";
import GeminiClient from "@/security/infrastructure/geminiClient";


function registerSecurityDependencies() {

container.register(TOKENS_SECURITY.aiRiskEngine, {
  useClass: GeminiRiskEngine,
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

container.register(TOKENS_SECURITY.trustedDeviceRepo, {
  useClass: TrustedDeviceRepository,
});

container.register("GeminiClient", {
  useFactory: () =>
    new GeminiClient()
});
}
export default registerSecurityDependencies