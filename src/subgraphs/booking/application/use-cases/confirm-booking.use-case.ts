//src/subgraphs/booking/application/use-cases/confirm-booking.use-case.ts

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens.js";
import { BookingGateway } from "@/subgraphs/ai/resolvers/BookingGateway.js";
import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository.js";


@injectable()
export class ConfirmBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.gateway.bookingGateway) private bookingGateway: BookingGateway,
    @inject(TOKENS_BOOKING.repository.bookingRepository) private bookingRepository: IBookingRepository,
  ) {}
  
  async execute(id: string) {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    booking.confirm();
    await this.bookingRepository.save(booking);
    return booking;
  }
}