//src/subgraphs/review/application/usecase/UpdateReviewUseCase

import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { ReviewRepository } from "../../infrastructure/repos/ReviewRepository";
import { inject, injectable } from "tsyringe";
import { ReviewValidationService } from "../../infrastructure/services/ReviewValidationService";
import { Review } from "../../domain/entities/Review";

@injectable()
export class UpdateReviewUseCase {
    
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepository: ReviewRepository,
    @inject(TOKENS_REVIEW.service.validationService)
    private validationService: ReviewValidationService
  ) {}

  async execute(id: string, updateData: Partial<Review>) {
    const review = await this.reviewRepository.findById(id);
    if (!review) {
      throw new Error("Review not found");
    }

    const updatedReview = { ...review, ...updateData };
    await this.validationService.execute(updatedReview);
    
    await this.reviewRepository.update(updatedReview);
    return updatedReview;
  }

}