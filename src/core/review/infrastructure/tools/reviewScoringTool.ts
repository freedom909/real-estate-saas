import { ReviewAIContext } from "@/core/booking/domain/entities/contexts/reviewAIContext";
import { injectable } from "tsyringe";


@injectable()
export class ReviewScoringTool {
  async execute(context: ReviewAIContext & { sentiment: any; moderation: any }) {
    // Placeholder for actual review scoring logic
    let score = context.sentiment.score * 100;
    if (context.moderation.isFlagged) score -= 30;
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}