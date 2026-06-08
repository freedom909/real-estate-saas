import { injectable } from "tsyringe";
import { ReviewGateway } from "./reviewGateway";
import { ReviewAIContext } from "./reviewAIContext";

@injectable()
export class ReviewACL {
  constructor(private gateway: ReviewGateway) {}

  async getContext(reviewId: string): Promise<ReviewAIContext> {
    const raw = await this.gateway.fetchReviewData(reviewId);

    return {
      reviewId: raw.id,
      userId: raw.authorId,
      listingId: raw.listingRefId,
      rating: raw.score,
      text: raw.comment,
      timestamp: raw.createdAt,
      ipAddress: raw.clientIp,
      metadata: {
        source: raw.source
      }
    };
  }
}