import { DomainEvent } from "@/shared/eventbus/domain.event";

export class BookingCancelledEvent extends DomainEvent {

  public readonly type = "BOOKING_CANCELLED";
  public readonly eventName = "BOOKING_CANCELLED";

  constructor(
    public readonly bookingId: string,
    public readonly guestId: string,
    public readonly tenantId: string,
    public readonly listingId: string,
    public readonly price: number,
    public readonly checkInDate: Date,
    public readonly checkOutDate: Date,
    public readonly reason: string,
  ) {
    super();
  }
}