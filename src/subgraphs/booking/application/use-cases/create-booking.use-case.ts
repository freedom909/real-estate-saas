import { injectable, inject } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { Booking } from "../../domain/entities/booking.entity";
import { DateRange } from "../../domain/value-objects/date-range.vo";
import { v4 as uuidv4 } from "uuid";

@injectable()
export class CreateBookingUseCase {
  constructor(
    @inject("BookingRepository")
    private repo: IBookingRepository
  ) {}

  async execute(input: any) {
    const booking = Booking.create({
      id: uuidv4(),
      listingId: input.listingId,
      guestId: input.guestId,
      dateRange: new DateRange(
        new Date(input.checkInDate),
        new Date(input.checkOutDate)
      ),
      totalCost: input.totalCost,
    });

    await this.repo.save(booking);
    return booking.toJSON();
  }
}