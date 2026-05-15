//src/subgraphs/review/application/DeleteReviewUseCase.ts

import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { ReviewRepository } from "@/subgraphs/review/infrastructure/repos/ReviewRepository";
import { inject, injectable } from "tsyringe";

@injectable()
export class DeleteReviewUseCase {
    
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepository: ReviewRepository
  ) {}

  async execute(id: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    await this.reviewRepository.delete(id);
  }

}