
//src/ai-platfrom/application/capabilities/booking/booking.capability.interface.ts

export interface IBookingCapability {
  createBooking(input: {
    listingId: string;
    guestId: string;
    checkInDate: string | Date;
    checkOutDate: string | Date;
    tenantId: string;
    price?: number;
  }): Promise<any>;

  cancelBooking(
    bookingId: string,
    reason: string
  ): Promise<any>;

  confirmBooking(
    bookingId: string
  ): Promise<any>;

  completeBooking(
    bookingId: string
  ): Promise<any>;

}