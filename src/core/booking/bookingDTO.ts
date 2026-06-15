export interface BookingExternalDTO {
  id: string;
  guestId: string;
  price: number;
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