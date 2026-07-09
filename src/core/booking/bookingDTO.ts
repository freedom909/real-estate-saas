export interface BookingExternalDTO {
  id: string;
  customerId: string;
  price: number;
  status: string;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
  };
  customerStats: {
    cancellationCount: number;
    totalBookingsCount: number;
  };
}