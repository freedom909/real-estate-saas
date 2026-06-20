export interface IReviewCapability {
  createReview(input: any): Promise<any>;
  respondToReview(reviewId: string, response: string): Promise<any>;
  analyzeReview(reviewId: string): Promise<any>;
}
