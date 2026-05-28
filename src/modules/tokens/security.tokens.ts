export const TOKENS_SECURITY = {
  riskEngine: Symbol.for("RiskEngine"),
  decisionEngine: Symbol.for("DecisionEngine"),
  auditRepo: Symbol.for("AuditRepo"),
  aiRiskEngine: Symbol.for("aiRiskEngine"),
  otpService: Symbol.for("OtpService"),
  trustedDeviceRepo: Symbol.for("TrustedDeviceRepo"),
  challengeRepo: Symbol.for("ChallengeRepo"),
  sessionPort: Symbol.for("SessionPort"),


  services: {
    policyEngine: Symbol.for("security.policyEngine"),
    blacklist: Symbol.for("security.blacklist"),
    tokenBindingService: Symbol.for("security.tokenBindingService"),
    geminiSecurityService: Symbol.for("security.geminiSecurityService"),
    uiStrategyService: Symbol.for("security.uiStrategyService"),
    decisionRiskEngine: Symbol.for("security.DecisionRiskEngine"),
    riskCalculator: Symbol.for("security.RiskCalculator"),
    geminiClient: Symbol.for("security.GeminiClient"),
    riskEventRepo: Symbol.for("security.RiskEventRepo"),
    pipeline: Symbol.for("security.SecurityPipeline"),
  },

   repos: {
    securityEventRepository: Symbol.for("security.securityEventRepository"),
      trustedDeviceRepo: Symbol.for("security.trustedDeviceRepo"),
      riskEventRepo: Symbol.for("security.riskEventRepo"),
      challengeRepo: Symbol.for("security.challengeRepo"),
  },

  models:{
    trustedDevice: Symbol.for("security.trustedDeviceModel"),
    riskEventModel: Symbol.for("security.riskEventModel"),
  },
  

  evaluateRiskUseCase: Symbol.for("security.evaluateRiskUseCase"),
};