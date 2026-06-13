import { ReviewAIContext } from "@/core/booking/domain/entities/contexts/reviewAIContext";
import { injectable } from "tsyringe";


@injectable()
export class ContentModerationTool {
  async execute(context: ReviewAIContext) {
    // Placeholder for actual content moderation logic
    const flags = context.text.includes("spam") ? ["SPAM"] : [];
    return {
      isFlagged: flags.length > 0, flags, confidence: flags.length > 0 ? 0.9 : 0.1
    };
  }
}