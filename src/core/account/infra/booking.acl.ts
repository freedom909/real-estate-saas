// BookingACL — normalizes booking data from the Booking Subgraph for the Account domain
import { injectable, inject } from "tsyringe";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.token";
import { BookingGateway, BookingExternalDTO } from "./gateways/booking.gateway";

export interface BookingContextDTO {
  bookingId: string;
  userId: string;
  amount: number;
  status: string;
  ipAddress: string;
  userAgent: string;
  history: {
    previousCancellations: number;
    totalBookings: number;
  };
  metadata: Record<string, unknown>;
  riskScore: number;
}

@injectable()
export class BookingACL {
  async getBookingsByListingIds(listingIds: string[]) {
    return this.gateway.fetchBookingDataByListingIds(listingIds);
  }
  constructor(
    @inject(TOKENS_ACCOUNT.BookingGateway)
    private gateway: BookingGateway
  ) {}

  /**
   * Fetch all bookings for a user and normalize them for Account domain use.
   */
  async getContexts(userId: string): Promise<BookingContextDTO[]> {
    const rawBookings: BookingExternalDTO[] = await this.gateway.fetchBookingData(userId);
    return rawBookings.map((booking) => ({
      bookingId: booking.id,
      userId: booking.customerId,
      amount: booking.price,
      status: booking.status,
      ipAddress: booking.metadata?.ipAddress ?? "",
      userAgent: booking.metadata?.userAgent ?? "",
      history: {
        previousCancellations: booking.customerStats?.cancellationCount ?? 0,
        totalBookings: booking.customerStats?.totalBookingsCount ?? 0,
      },
      metadata: (booking.metadata as Record<string, unknown>) ?? {},
      riskScore: 0,
    }));
  }

  /**
   * Fetch raw bookings (for dashboard queries that need the full objects).
   */
  async getRawBookings(userId: string): Promise<BookingExternalDTO[]> {
    return this.gateway.fetchBookingData(userId);
  }
}
