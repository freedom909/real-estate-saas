import { injectable } from "tsyringe";
import { BookingAIContext } from "../../domain/entities/contexts/bookingAI.context";


@injectable()
export class BookingFraudTool {
  async execute(context: BookingAIContext) {
    const flags = [];
    
    if (context.amount > 5000) flags.push("HIGH_VALUE_TRANSACTION");
    if (context.history && context.history.previousCancellations > 2) flags.push("FREQUENT_CANCELLER");
    
    const riskLevel = flags.length > 0 ? "MEDIUM" : "LOW";

    return {
      isSuspicious: flags.length > 1,
      riskLevel,
      flags
    };
  }
}