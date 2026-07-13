// GetAdminDashboardUseCase — returns system-wide aggregated data for admins
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { BookingACL } from "../../infra/booking.acl";
import { ListingACL } from "../../infra/listing.acl";
import { ReviewACL } from "../../infra/review.acl";

@injectable()
export class GetAdminDashboardUseCase {
  constructor(
    @inject(TOKENS_ACCOUNT.BookingACL) private bookingACL: BookingACL,
    @inject(TOKENS_ACCOUNT.ListingACL) private listingACL: ListingACL,
    @inject(TOKENS_ACCOUNT.ReviewACL) private reviewACL: ReviewACL
  ) {}

  /**
   * Admin dashboard — fetches data for a specific user (admin can view any user).
   */
  async execute(userId: string) {
    const [bookings, reviews] = await Promise.all([
      this.bookingACL.getRawBookings(userId),
      this.reviewACL.getReviewsByUser(userId),
    ]);

    return { bookings, listings: [], reviews };
  }
}
