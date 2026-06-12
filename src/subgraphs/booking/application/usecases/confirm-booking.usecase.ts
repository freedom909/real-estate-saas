//src/subgraphs/booking/application/usecases/confirm-booking.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingConfirmedEvent } from "../../domain/events/booking-confirm.event";
import { BookingStatus } from "../../infrastructure/models/booking.model";

@injectable()
export class ConfirmBookingUseCase {
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: IBookingRepository,

    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

async execute(id: string) {
  const booking =
    await this.bookingRepository.findById(id);

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.status !== BookingStatus.Pending) {
    throw new Error(
      "Only pending bookings can be confirmed"
    );
  }
    // Use domain logic for state transition
    booking.confirm();

    // Save using the standard repository method
    await this.bookingRepository.save(booking);

    await this.eventBus.publish(
      new BookingConfirmedEvent(
        booking.id,
        booking.guestId,
        booking.tenantId,      
        booking.listingId,
        booking.totalCost
      )
    );

    return booking;
  }
}