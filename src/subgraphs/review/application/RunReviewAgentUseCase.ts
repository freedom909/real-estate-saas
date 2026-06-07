import { inject, injectable } from "tsyringe";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ReviewACL } from "@/subgraphs/booking/domain/entities/contexts/reviewACL";
import { ReviewAnalysisAgent } from "./agents/ReviewAnalysisAgent";

@injectable()
export class RunReviewAgentUseCase {
  constructor(
    @inject(TOKENS_AI.acl.reviewACL)
    private acl: ReviewACL,
    @inject(TOKENS_AI.agent.reviewAnalysisAgent)
    private agent: ReviewAnalysisAgent
  ) {}

  async execute(reviewId: string) {
    const context = await this.acl.getContext(reviewId);
    return this.agent.execute(context);
  }
}