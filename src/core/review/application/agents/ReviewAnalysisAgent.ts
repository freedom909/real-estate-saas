import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { SentimentAnalysisTool } from "../../infrastructure/tools/sentimentAnalysisTool";
import { ContentModerationTool } from "../../infrastructure/tools/contentModerationTool";
import { ReviewScoringTool } from "../../infrastructure/tools/reviewScoringTool";
import { ReviewAIContext } from "@/core/booking/domain/entities/contexts/reviewAIContext";
// These dependencies should also be moved/referenced within the review subgraph


@injectable()
export class ReviewAnalysisAgent {
  constructor(
    @inject(TOKENS_AI.tool.sentimentAnalysisTool) private sentimentTool: SentimentAnalysisTool,
    @inject(TOKENS_AI.tool.contentModerationTool) private moderationTool: ContentModerationTool,
    @inject(TOKENS_AI.tool.reviewScoringTool) private scoringTool: ReviewScoringTool
  ) {}

  /**
   * Executes the review analysis workflow and provides a business recommendation.
   */
  async execute(context: ReviewAIContext) {
    const sentiment = await this.sentimentTool.execute(context);
    const moderation = await this.moderationTool.execute(context);
    const score = await this.scoringTool.execute({ ...context, sentiment, moderation });

    return {
      reviewId: context.reviewId,
      sentiment, moderation, score,
      recommendation: score > 70 ? "APPROVE" : score > 40 ? "FLAG_FOR_REVIEW" : "REJECT"
    };
  }
}