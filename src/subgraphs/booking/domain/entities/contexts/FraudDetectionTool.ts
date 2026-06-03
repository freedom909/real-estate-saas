import { injectable } from "tsyringe";
import { PaymentAIContext } from "../../domain/entities/contexts/PaymentAIContext";

@injectable()
export class FraudDetectionTool {
  async execute(context: PaymentAIContext) {
    const isHighValue = context.amount > 1000;
    return {
      fraudFlags: isHighValue ? ["HIGH_VALUE_THRESHOLD"] : [],
      isSuspicious: isHighValue,
      confidence: 0.92,
      engine: "PatternMatchV2"
    };
  }
}