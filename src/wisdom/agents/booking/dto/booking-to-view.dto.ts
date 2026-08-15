// src/wisdom/agents/booking/dto/booking-to-view.dto.ts

// src/wisdom/agents/booking/dto/booking-toView.ts

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
  currency: string;

  status: string;
}