// GetOwnerDashboardUseCase — returns aggregated data for property owners
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { BookingACL } from "../../infra/booking.acl";
import { ListingACL } from "../../infra/listing.acl";
import { ReviewACL } from "../../infra/review.acl";

@injectable()
export class GetOwnerDashboardUseCase {
  constructor(
    @inject(TOKENS_ACCOUNT.BookingACL) private bookingACL: BookingACL,
    @inject(TOKENS_ACCOUNT.ListingACL) private listingACL: ListingACL,
    @inject(TOKENS_ACCOUNT.ReviewACL) private reviewACL: ReviewACL
  ) {}

  async execute(ownerId: string) {
    const listings = await this.listingACL.getListingsByOwner(ownerId);

    // For each listing, we would typically fetch associated bookings and reviews
    const bookings = await this.bookingACL.getBookingsByListingIds(listings.map((l) => l.id));
    const reviews = await this.reviewACL.getReviewsByListingIds(listings.map((l) => l.id));

    return {
      listings,
      bookings: [],
      reviews: [],
    };
  }
}
