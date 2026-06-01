import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ReviewAIContext } from "../../../domain/entities/contexts/ReviewAIContext";
import { SentimentAnalysisTool } from "../../tools/review/SentimentAnalysisTool";
import { ContentModerationTool } from "../../tools/review/ContentModerationTool";
import { ReviewScoringTool } from "../../tools/review/ReviewScoringTool";

@injectable()
export class ReviewAnalysisAgent {
  constructor(
    @inject(TOKENS_AI.tool.sentimentAnalysisTool) private sentimentTool: SentimentAnalysisTool,
    @inject(TOKENS_AI.tool.contentModerationTool) private moderationTool: ContentModerationTool,
    @inject(TOKENS_AI.tool.reviewScoringTool) private scoringTool: ReviewScoringTool
  ) {}

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