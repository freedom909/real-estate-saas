import { injectable, inject } from "tsyringe";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { BookingPricingService } from "../../domain/service/booking-pricing.service";
import { IListingGateway } from "../../domain/gateways/i-listing.gateway";

@injectable()
export class UpdateBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository,
    @inject(TOKENS_BOOKING.gateway.listingGateway)
    private listingGateway: IListingGateway
  ) {}

  async execute(input: {
    id: string;
    checkInDate?: string;
    checkOutDate?: string;
    price?: number;
  }) {
    const booking = await this.repo.findById(input.id);
    if (!booking) throw new Error("Booking not found");

    const updateFields: { checkInDate?: Date; checkOutDate?: Date; price?: number } = {};

    if (input.checkInDate && input.checkOutDate) {
      const checkIn = new Date(input.checkInDate);
      const checkOut = new Date(input.checkOutDate);

      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        throw new Error("Invalid date");
      }

      updateFields.checkInDate = checkIn;
      updateFields.checkOutDate = checkOut;

      const nightlyPrice = await this.listingGateway.getListingPrice(booking.listingId);
      updateFields.price = BookingPricingService.calculatePrice(nightlyPrice, checkIn, checkOut);
    } else if (input.price !== undefined) {
      updateFields.price = input.price;
    }

    booking.update(updateFields);
    await this.repo.save(booking);

    return booking.toJSON();
  }
}
