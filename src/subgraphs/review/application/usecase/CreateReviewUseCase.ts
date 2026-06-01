import { inject, injectable } from "tsyringe";
import { TOKENS_REVIEW } from "../../container/review.tokens";
import { IReviewRepository } from "../../domain/repositories/IReviewRepository";
import { Review, ReviewStatus } from "../../domain/entities/Review";
import { Rating } from "../../domain/value-objects/Rating";

@injectable()
export class CreateReviewUseCase {
  constructor(
    @inject(TOKENS_REVIEW.repository.reviewRepository)
    private reviewRepo: IReviewRepository
  ) {}

  async execute(input: {
    bookingId: string;
    listingId: string;
    guestId: string;
    hostId: string;
    rating: number;
    content: string;
  }): Promise<Review> {
    const review = new Review({
      bookingId: input.bookingId,
      listingId: input.listingId,
      guestId: input.guestId,
      hostId: input.hostId,
      rating: new Rating(input.rating),
      content: input.content,
      status: ReviewStatus.PENDING
    });

    return this.reviewRepo.save(review);
  }
}