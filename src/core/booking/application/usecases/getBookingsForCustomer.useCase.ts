import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

@injectable()
export class GetBookingsForCustomerUseCase {

  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: IBookingRepository
  ) {}

  async execute(
    customerId: string
  ) {
    return this.bookingRepository.findByCustomerId(
      customerId
    );
  }
}