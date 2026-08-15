// src/wisdom/agents/booking/bookingPresentation/view.mapper.ts
//
// BookingViewMapper — converts Booking entity → full technical view (for UI).
// Contains everything: IDs, prices, dates, status — complete and actionable.

import { Booking } from "@/core/booking/domain/entities/booking.entity";

export interface BookingView {
  id: string;
  reservationNumber: string;
  customerId: string;
  tenantId: string;
  listingId: string;
  listingName: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  status: string;
}

export class BookingViewMapper {
  static toView(booking: Booking, listingName: string): BookingView {
    return {
      id: booking.id,
      reservationNumber: booking.reservationNumber?.value ?? "",
      customerId: booking.customerId,
      tenantId: booking.tenantId,
      listingId: booking.listingId,
      listingName,
      checkInDate: booking.dateRange.checkInDate.toISOString(),
      checkOutDate: booking.dateRange.checkOutDate.toISOString(),
      price: booking.price, // number, not {amount, currency}
      status: booking.status,
    };
  }
}
