import { injectable, inject } from "tsyringe";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingCancelledEvent } from "../../domain/events/booking-cancelled.event";

// ── Calendar Integration ──
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ReleaseSlotUseCase } from "@/core/calendar/application/usecases/release-slot.usecase";

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

    // ── Calendar: release slots on cancellation ──
    @inject(TOKENS_CALENDAR.usecase.releaseSlotUseCase)
    private releaseSlotUseCase: ReleaseSlotUseCase
  ) {}

  async execute(
    bookingId: string,
    reason: string
  ) {
    const booking =
      await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.cancel(reason);

    await this.bookingRepository
      .save(booking);

    // ── Calendar: release all reserved slots ──
    try {
      await this.releaseSlotUseCase.execute({
        bookingId: booking.id,
        reason,
      });
    } catch (calendarError) {
      // Log but don't fail the cancellation — calendar release is best-effort
      console.error(
        `⚠️ Failed to release calendar slots for booking ${bookingId}:`,
        calendarError
      );
    }

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
