import { BookingSnapshot } from "../snapshot/booking.snapshot";
import { ListingSnapshot } from "../snapshot/listing.snapshot";
import { ReviewSnapshot } from "../snapshot/review.snapshot";


export interface ResourceContext {

  listingId?: string;

  bookingId?: string;

  reviewId?: string;

  conversationId?: string;

  messageId?: string;

  listing?: ListingSnapshot;

  booking?: BookingSnapshot;

  review?: ReviewSnapshot;
}