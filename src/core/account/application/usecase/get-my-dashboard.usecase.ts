// GetMyDashboardUseCase — returns bookings, listings, and reviews for the logged-in user
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { BookingACL } from "../../infra/booking.acl";
import { ListingACL } from "../../infra/listing.acl";
import { ReviewACL } from "../../infra/review.acl";

@injectable()
export class GetMyDashboardUseCase {
  constructor(
    @inject(TOKENS_ACCOUNT.BookingACL) private bookingACL: BookingACL,
    @inject(TOKENS_ACCOUNT.ListingACL) private listingACL: ListingACL,
    @inject(TOKENS_ACCOUNT.ReviewACL) private reviewACL: ReviewACL
  ) {}

  async execute(userId: string) {
    const [bookings, listings, reviews] = await Promise.all([
      this.bookingACL.getRawBookings(userId),
      this.listingACL.getListingsByOwner(userId),
      this.reviewACL.getReviewsByUser(userId),
    ]);

    return { bookings, listings, reviews };
  }
}
