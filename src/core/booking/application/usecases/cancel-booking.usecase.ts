import { injectable, inject } from "tsyringe";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";


@injectable()
export class CancelBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository
  ) {}

  async execute(id: string, userId: string) {
    const booking = await this.repo.findById(id);

    if (!booking) throw new Error("Booking not found");
    if (booking.guestId !== userId) throw new Error("Unauthorized");

    booking.cancel();

    await this.repo.save(booking);

    return { success: true };
  }
}