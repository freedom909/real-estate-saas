import { injectable, inject } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";

@injectable()
export class GetBookingUseCase {
  constructor(
    @inject("BookingRepository")
    private repo: IBookingRepository
  ) {}

  async execute(id: string) {
    const booking = await this.repo.findById(id);
    if (!booking) throw new Error("Not found");
    return booking.toJSON();
  }
}