// FILE: domain/events/booking-confirm.event.ts 


import { DomainEvent } from "@/shared/eventbus/domain.event";

export class BookingConfirmedEvent extends DomainEvent {

  public readonly type = "BOOKING_CONFIRMED";
  public readonly eventName = "CONFIRMED";

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