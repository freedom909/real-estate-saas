//

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../repositories/i-booking.repository";
import { TOKENS_EVENT_BUS } from "@/modules/tokens/event.bus.token";
import { IEventBus } from "@/shared/eventbus/IEventBus";
import { DomainEvent } from "@/shared/eventbus/domain.event";

@injectable()
export class BookingCompletedEvent extends DomainEvent{
    public readonly type = "BOOKING_COMPLETED";
    public readonly eventName = "COMPLETED";
  
    constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly price: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly occurredOn: Date = new Date()
    ) {
        super();
    }


}