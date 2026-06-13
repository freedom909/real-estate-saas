import { injectable, inject } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

@injectable()
export class GetBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private repo: IBookingRepository
  ) {}

  async execute(id: string) {
    const booking = await this.repo.findById(id);
    if (!booking) throw new Error("Not found");
    return booking.toJSON();
  }
}