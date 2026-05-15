//src/

import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { inject, injectable } from "tsyringe";
import { ReviewRepository } from "../../infrastructure/repos/ReviewRepository";
import { ReviewValidationService } from "../../infrastructure/services/ReviewValidationService";

@injectable()
export class ReplyToReviewUseCase {
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepository: ReviewRepository,
    @inject(TOKENS_REVIEW.service.validationService)
    private validationService: ReviewValidationService
  ) {}

  async execute(id: string, reply: string): Promise<void> {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }
    this.validationService.validateReply(reply);
    
    review.reply = reply;
    review.repliedAt = new Date();

    await this.reviewRepository.update(review);
  }
}



