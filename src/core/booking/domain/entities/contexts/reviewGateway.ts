import { injectable } from "tsyringe";

@injectable()
export class ReviewGateway {
  /**
   * Fetches raw review data from the Review Subgraph.
   * In a real federation, this would use a GraphQL client or internal SDK.
   */
  async fetchReviewData(reviewId: string) {
    // Mocked response from Review Subgraph
    return {
      id: reviewId,
      authorId: "user_999",
      listingRefId: "listing_abc",
      score: 4,
      comment: "This is a good review, but it might contain spam.",
      createdAt: new Date().toISOString(),
      clientIp: "203.0.113.45",
      source: "WEB"
    };
  }
}