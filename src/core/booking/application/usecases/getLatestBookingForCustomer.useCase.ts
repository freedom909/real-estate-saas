// GetLatestBookingForCustomer.useCase.ts

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { inject, injectable } from "tsyringe";
import { BookingRepository } from "../../infrastructure/repos/bookingRepository";
import { Booking } from "../../domain/entities/booking.entity";

@injectable()
export class GetLatestBookingForCustomerUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: BookingRepository,
  ) { }

  async execute(customerId: string): Promise<Booking> {
    if (!customerId) {
      throw new Error("Customer ID is required to retrieve latest booking.");
    }

    const booking = await this.bookingRepository.findByLatestByCustomerId(customerId);

    if (!booking) {
      throw new Error(`No bookings found for customer ${customerId}.`);
    }

    return booking;
  }
}
