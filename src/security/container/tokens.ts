export const TOKENS_SECURITY = {
  riskEngine: Symbol.for("RiskEngine"),
  decisionEngine: Symbol.for("DecisionEngine"),
  auditRepo: Symbol.for("AuditRepo"),
  aiService: Symbol.for("AIService"),
  evaluateRiskUseCase: Symbol.for("EvaluateRiskUseCase"),

  services: {
    policyEngine: Symbol.for("security.policyEngine"),
    blacklist: Symbol.for("security.blacklist"),
    tokenBindingService: Symbol.for("security.tokenBindingService"),
    geminiSecurityService: Symbol.for("security.geminiSecurityService"),
    uiStrategyService: Symbol.for("security.uiStrategyService"),
    evaluateRiskUseCase: Symbol.for("security.EvaluateRiskUseCase"),
    decisionRiskEngine: Symbol.for("security.DecisionRiskEngine"),
    riskCalculator: Symbol.for("security.RiskCalculator"),
    geminiClient: Symbol.for("security.GeminiClient"),
    riskEventRepo: Symbol.for("security.RiskEventRepo"),
    pipeline: Symbol.for("security.SecurityPipeline"),
  },

   repos: {
    securityEventRepository: Symbol.for("security.securityEventRepository"),
  },

  models:{
    riskEventModel: Symbol.for("security.riskEventModel"),
  }
};