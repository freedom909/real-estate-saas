import { injectable, inject } from "tsyringe";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";

@injectable()
export class CheckInBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository
  ) {}

  async execute(id: string) {
    const booking = await this.repo.findById(id);
    if (!booking) throw new Error("Booking not found");

    booking.checkIn();
    await this.repo.save(booking);

    return booking.toJSON();
  }
}
