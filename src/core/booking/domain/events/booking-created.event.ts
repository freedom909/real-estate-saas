// booking/domain/events/booking-created.event.ts

import { DomainEvent } from "@/shared/eventbus/domain.event";

export class BookingCreatedEvent extends DomainEvent {

  public readonly type = "BOOKING_CREATED";
  public readonly eventName = "CREATED";

  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly price: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date
  ) {
    super();
  }
}