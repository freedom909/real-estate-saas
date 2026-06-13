import { ReviewAIContext } from "@/core/booking/domain/entities/contexts/reviewAIContext";
import { injectable } from "tsyringe";


@injectable()
export class SentimentAnalysisTool {
  async execute(context: ReviewAIContext) {
    // Placeholder for actual sentiment analysis logic
    const score = context.text.includes("bad") ? 0.2 : context.text.includes("good") ? 0.8 : 0.5;
    return {
      score, magnitude: 0.7, label: score > 0.6 ? "POSITIVE" : score < 0.4 ? "NEGATIVE" : "NEUTRAL"
    };
  }
}