// GetLatestBookingForGuest.useCase.ts

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { inject, injectable } from "tsyringe";
import { BookingRepository } from "../../infrastructure/repos/bookingRepository";
import { Booking } from "../../domain/entities/booking.entity";

@injectable()
export class GetLatestBookingForGuestUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: BookingRepository,
  ) { }

  async execute(guestId: string): Promise<Booking> {
    if (!guestId) {
      throw new Error("Guest ID is required to retrieve latest booking.");
    }

    const booking = await this.bookingRepository.findByLatestByGuestId(guestId);

    if (!booking) {
      throw new Error(`No bookings found for guest ${guestId}.`);
    }

    return booking;
  }
}
