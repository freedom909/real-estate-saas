//

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../domain/repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { BookingCompletedEvent } from "../../domain/events/booking-completed.event";

@injectable()
export class CompleteBookingUseCase {
    
  constructor(
    @inject(TOKENS_BOOKING.repository.bookingRepository)
    private bookingRepository: IBookingRepository,
    @inject(TOKENS_EVENT_BUS.eventBus)
    private eventBus: IEventBus,
  ) {}

  async execute(id: string) {
    const booking = await this.bookingRepository.findById(id);

    if (!booking) {
      throw new Error("Booking not found");
    }

    // 🔥 DOMAIN STATE TRANSITION
    booking.complete();

    // Save using the standard repository method
    await this.bookingRepository.save(booking);

    // Publish event if needed (Optional: Define BookingCompletedEvent in domain events)
   
    await this.eventBus.publish(
      new BookingCompletedEvent(
        booking.id,
        booking.guestId,
        booking.tenantId,
        booking.listingId,
        
        booking.price,
        booking.dateRange.checkInDate,
        booking.dateRange.checkOutDate
      )
    );
    return booking.toJSON();
  }

}