export interface BookingExternalDTO {
  id: string;
  guestId: string;
  totalPrice: number;
  status: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  };
  guestStats: {
    cancellationCount: number;
    totalBookingsCount: number;
  };
}