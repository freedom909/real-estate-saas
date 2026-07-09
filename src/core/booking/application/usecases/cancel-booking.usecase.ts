import { injectable, inject } from "tsyringe";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingCancelledEvent } from "../../domain/events/booking-cancelled.event";



@injectable()
export class CancelBookingUseCase {

  constructor(
    @inject(
      TOKENS_BOOKING.repository.bookingRepository
    )
    private bookingRepository:
      IBookingRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

  async execute(
    bookingId: string,
    reason: string
  ) {
    const booking =
      await this.bookingRepository
        .findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.cancel(reason);

    await this.bookingRepository
      .save(booking);

    await this.eventBus.publish(new BookingCancelledEvent(
      booking.id,
      booking.customerId,
      booking.tenantId,
      booking.listingId,
      booking.price,
      booking.dateRange.checkInDate,
      booking.dateRange.checkOutDate,
      reason,
    ));

return booking;

  }
}

