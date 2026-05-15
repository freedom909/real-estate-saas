import { injectable, inject } from "tsyringe";
import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { IReviewRepository } from "../../IReviewRepository";
import { Review } from "../../domain/entities/Review";

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

  async execute(review: Review): Promise<void> {
    await this.validateOwnership(review.props.bookingId);
  }
}