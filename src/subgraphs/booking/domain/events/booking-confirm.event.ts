// FILE: domain/events/booking-confirm.event.ts 

import { BookingStatus } from "../../infrastructure/models/booking.model";
import { DomainEvent } from "@/shared/eventbus/domain.event";

export class BookingConfirmedEvent extends DomainEvent {

  readonly eventName = BookingStatus.Confirmed;

  constructor(
    public readonly bookingId: string,
    public readonly guestId: string,
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly totalPrice: number
  ) {
    super();
  }
}