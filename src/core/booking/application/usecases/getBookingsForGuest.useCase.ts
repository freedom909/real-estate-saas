import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

@injectable()
export class GetBookingsForGuestUseCase {

  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: IBookingRepository
  ) {}

  async execute(
    guestId: string
  ) {
    return this.bookingRepository.findByGuestId(
      guestId
    );
  }
}