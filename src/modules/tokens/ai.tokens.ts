//src/modules/tokens/ai.tokens.ts
export const TOKENS_AI = {

tool: {
  rewriteDescriptionTool: Symbol.for("RewriteDescriptionTool"),
  rewriteTitleTool: Symbol.for("RewriteTitleTool"),
  analyzeListingTool: Symbol.for("AnalyzeListingTool"),
  listingOptimizationTool: Symbol.for("ListingOptimizationTool"),
  generateSEOKeywordsTool: Symbol.for("GenerateSEOKeywordsTool"),
  priceOptimizationTool: Symbol.for("PriceOptimizationTool"),
  categoryOptimizationTool: Symbol.for("CategoryOptimizationTool"),
  bookingOptimizationTool: Symbol.for("BookingOptimizationTool"),
  fraudDetectionTool: Symbol.for("FraudDetectionTool"),
  anomalyDetectionTool: Symbol.for("AnomalyDetectionTool"),
  paymentRiskScoringTool: Symbol.for("PaymentRiskScoringTool"),
  reviewAnalysisTool: Symbol.for("ReviewAnalysisTool"),
  sentimentAnalysisTool: Symbol.for("SentimentAnalysisTool"),
  contentModerationTool: Symbol.for("ContentModerationTool"),
  reviewValidationTool: Symbol.for("ReviewValidationTool"),
  reviewReplyTool: Symbol.for("ReviewReplyTool"),
  reviewReportTool: Symbol.for("ReviewReportTool"),
  bookingFraudTool: Symbol.for("BookingFraudTool"),
  paymentRiskTool: Symbol.for("PaymentRiskTool"),
},
agent: {
  listingOptimizationAgent: Symbol.for("ListingOptimizationAgent"),
  bookingOptimizationAgent: Symbol.for("BookingOptimizationAgent"),
  bookingFraudAgent: Symbol.for("BookingFraudAgent"),
  paymentRiskAgent: Symbol.for("PaymentRiskAgent"),
  reviewAnalysisAgent: Symbol.for("ReviewAnalysisAgent"),
},

usecase: {
  runListingAgentUseCase: Symbol.for("RunListingAgentUseCase"),
  runBookingAgentUseCase: Symbol.for("RunBookingAgentUseCase"),
  runPaymentAgentUseCase: Symbol.for("RunPaymentAgentUseCase"),
  runReviewAgentUseCase: Symbol.for("RunReviewAgentUseCase"),
},
acl: {
  reviewACL: Symbol.for("ReviewACL"),
},


}