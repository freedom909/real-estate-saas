import { Review } from "@/core/review/infrastructure/services/review";


export interface IReviewRepository {
  findById(id: string): Promise<Review | null>;
  save(review: Review): Promise<Review>;
  findByListingId(listingId: string): Promise<Review[]>;
  findByHostId(hostId: string): Promise<Review[]>;
  findByBookingId(bookingId: string): Promise<Review | null>;
  delete(id: string): Promise<void>;
}