import { injectable, inject } from "tsyringe";
import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { IReviewRepository } from "../repositories/IReviewRepository";

@injectable()
export class ReviewValidationService {
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepo: IReviewRepository
  ) {}

  async validateOwnership(bookingId: string): Promise<void> {
    const existing = await this.reviewRepo.findByBookingId(bookingId);
    if (existing) {
      throw new Error("Duplicate review prevention: Booking already reviewed.");
    }
  }
}