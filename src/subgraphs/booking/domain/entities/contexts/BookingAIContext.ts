export interface BookingAIContext {
  bookingId: string;
  userId: string;
  amount: number;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  riskScore?: number;
  history?: {
    previousCancellations: number;
    totalBookings: number;
  };
  metadata: Record<string, any>;
}