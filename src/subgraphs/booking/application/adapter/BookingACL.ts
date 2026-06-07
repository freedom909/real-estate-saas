import { injectable } from "tsyringe";
import { BookingExternalDTO } from "../../BookingDTO";
import { BookingAIContext } from "../../domain/entities/contexts/bookingAIContext";
import { BookingGateway } from "../../BookingGateway";


@injectable()
export class BookingACL {
  constructor(private gateway: BookingGateway) {}

  async getContext(bookingId: string): Promise<BookingAIContext> {
    const rawData: BookingExternalDTO = await this.gateway.fetchBookingData(bookingId);

    // Mapping logic: Transforming external DTO to internal Domain Context
    return {
      bookingId: rawData.id,
      userId: rawData.guestId,
      amount: rawData.totalPrice,
      status: rawData.status,
      ipAddress: rawData.metadata.ipAddress,
      userAgent: rawData.metadata.userAgent,
      history: {
        previousCancellations: rawData.guestStats.cancellationCount,
        totalBookings: rawData.guestStats.totalBookingsCount,
      },
      metadata: {}, // AI-specific metadata can be initialized here
      riskScore: 0,  // Initial state for the Agent to populate
    };
  }
}