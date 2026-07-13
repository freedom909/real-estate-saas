// ReviewACL — normalizes review data from the Review Subgraph for the Account domain
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { ReviewGateway, ReviewExternalDTO } from "./gateways/review.gateway";

export interface ReviewContextDTO {
  reviewId: string;
  authorId: string;
  listingId: string;
  score: number;
  comment: string;
  status: string;
  createdAt: string;
}

@injectable()
export class ReviewACL {
  getReviewsByListingIds(arg0: string[]) {
    throw new Error("Method not implemented.");
  }
  constructor(
    @inject(TOKENS_ACCOUNT.ReviewGateway)
    private gateway: ReviewGateway
  ) {}

  /**
   * Fetch all reviews for a user and normalize them for Account domain use.
   */
  async getReviewsByUser(userId: string): Promise<ReviewContextDTO[]> {
    const raw = await this.gateway.fetchReviewsByUser(userId);
    return raw.map((r) => ({
      reviewId: r.id,
      authorId: r.authorId,
      listingId: r.listingId,
      score: r.score,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }
}
