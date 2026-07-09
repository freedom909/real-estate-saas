import { TOKENS_REVIEW } from "@/modules/tokens/review.tokens";
import { inject, injectable } from "tsyringe";
import { IReviewRepository } from "../../domain/entities/repos/IReviewRepository";
import { Review, ReviewStatus } from "../../infrastructure/services/review";
import { Rating } from "../../infrastructure/services/rating";


@injectable()
export class SubmitCustomerReviewUseCase {
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepo: IReviewRepository
  ) {}

  async execute(input: {
    bookingId: string;
    listingId: string;
    customerId: string;
    hostId: string;
    rating: number;
    content: string;
  }): Promise<Review> {
    console.log("input++:", input);
    const review = new Review({
      bookingId: input.bookingId,
      listingId: input.listingId,
      customerId: input.customerId,
      hostId: input.hostId,
      rating: new Rating(input.rating),
      content: input.content,
      status: ReviewStatus.PENDING
    });

    return this.reviewRepo.save(review);
  }
}