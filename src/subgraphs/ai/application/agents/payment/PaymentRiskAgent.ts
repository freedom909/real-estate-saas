import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { PaymentAIContext } from "../../domain/entities/contexts/PaymentAIContext";
import { FraudDetectionTool } from "../../tools/payment/FraudDetectionTool";
import { AnomalyDetectionTool } from "../../tools/payment/AnomalyDetectionTool";
import { PaymentRiskScoringTool } from "../../tools/payment/PaymentRiskScoringTool";

@injectable()
export class PaymentRiskAgent {
  constructor(
    @inject(TOKENS_AI.tool.fraudDetectionTool)
    private fraudTool: FraudDetectionTool,
    @inject(TOKENS_AI.tool.anomalyDetectionTool)
    private anomalyTool: AnomalyDetectionTool,
    @inject(TOKENS_AI.tool.paymentRiskScoringTool)
    private scoringTool: PaymentRiskScoringTool
  ) {}

  async execute(context: PaymentAIContext) {
    // Orchestrate multiple tools
    const [fraud, anomalies] = await Promise.all([
      this.fraudTool.execute(context),
      this.anomalyTool.execute(context)
    ]);

    const score = await this.scoringTool.execute({
      ...context,
      fraudResult: fraud,
      anomalyResult: anomalies
    });

    return {
      assessmentId: `risk_${Date.now()}`,
      score,
      details: { fraud, anomalies },
      recommendation: score > 75 ? "BLOCK" : score > 40 ? "REVIEW" : "ALLOW"
    };
  }
}