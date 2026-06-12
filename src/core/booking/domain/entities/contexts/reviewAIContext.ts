export interface ReviewAIContext {
  reviewId: string;
  userId: string;
  listingId: string;
  rating: number;
  text: string;
  timestamp: string;
  ipAddress?: string;
  metadata: Record<string, any>;
}