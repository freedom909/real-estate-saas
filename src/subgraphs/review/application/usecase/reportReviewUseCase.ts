//scr/subgraphs/

import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { inject, injectable } from "tsyringe";
import { ReviewRepository } from "../../infrastructure/repos/ReviewRepository";

@injectable()
export class ReportReviewUseCase {
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepository: ReviewRepository
  ) {}

  async execute(id: string, reason: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    review.isReported = true;
    review.reportReason = reason;

    await this.reviewRepository.update(review);
  }
}
