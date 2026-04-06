// domain/events/booking-created.event.ts
export class BookingCreatedEvent {
  constructor(
    public readonly bookingId: string,
    public readonly guestId: string,
    public readonly totalPrice: number
  ) {}
}