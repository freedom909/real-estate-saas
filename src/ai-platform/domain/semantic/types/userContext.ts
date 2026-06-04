// should this need to be expanded?
export interface UserContext {
  userId: string;
  roles?: string[];
  resources?: {
    listingId?: string;
    bookingId?: string;
    paymentId?: string;
    reviewId?: string;
  };
}