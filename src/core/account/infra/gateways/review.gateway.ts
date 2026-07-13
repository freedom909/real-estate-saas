// ReviewGateway — fetches review data from the Review Subgraph via GraphQL
import { injectable } from "tsyringe";
import { GraphQLClient, gql } from "graphql-request";
import { BaseGateway } from "@/infrastructure/utils/baseGateway";

export interface ReviewExternalDTO {
  id: string;
  authorId: string;
  listingId: string;
  score: number;
  comment: string;
  status: string;
  createdAt: string;
}

@injectable()
export class ReviewGateway extends BaseGateway {
  private client: GraphQLClient;

  constructor() {
    super();
    const endpoint = process.env.REVIEW_SUBGRAPH_URL || "http://localhost:4050/graphql";
    this.client = new GraphQLClient(endpoint, {
      headers: {
        Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
      },
    });
  }

  private readonly GET_REVIEWS_BY_USER_QUERY = gql`
    query GetReviewsByUser($userId: ID!) {
      reviewsByUser(userId: $userId) {
        id
        authorId
        listingId
        score
        comment
        status
        createdAt
      }
    }
  `;

  async fetchReviewsByUser(userId: string, retries = 3): Promise<ReviewExternalDTO[]> {
    try {
      const data = await this.client.request<{ reviewsByUser: ReviewExternalDTO[] }>(
        this.GET_REVIEWS_BY_USER_QUERY,
        { userId }
      );
      return data.reviewsByUser || [];
    } catch (error) {
      if (retries > 0) {
        return this.fetchReviewsByUser(userId, retries - 1);
      }
      throw error;
    }
  }
}
