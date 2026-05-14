//src/subgraphs/booking/application/use-cases/confirm-booking.use-case.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { BookingGateway } from "../../infrastructure/gateways/bookingGateway";
import { BookingRepository } from "../../infrastructure/repositories/bookingRepository";

@injectable()
export class ConfirmBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.gateway.bookingGateway) private bookingGateway: BookingGateway,
    @inject(TOKENS_BOOKING.repository.bookingRepository) private bookingRepository: BookingRepository,
  ) {}
  
  async execute(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.status !== "UPCOMING") {// プロパティ 'status' は型 'Booking' に存在しません。
      throw new Error("Only UPCOMING bookings can be confirmed");
    }
    booking.status = "CONFIRMED";
    await this.bookingRepository.update(booking);
    return booking;
  }
}