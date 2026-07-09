import { injectable } from "tsyringe";
import { BookingExternalDTO } from "../../bookingDTO";
import { BookingAIContext } from "../../domain/entities/contexts/bookingAI.context";
import { BookingGateway } from "../../bookingGateway";


@injectable()
export class BookingACL {
  constructor(private gateway: BookingGateway) {}

  async getContext(bookingId: string): Promise<BookingAIContext> {
    const rawData: BookingExternalDTO = await this.gateway.fetchBookingData(bookingId);

    // Mapping logic: Transforming external DTO to internal Domain Context
    return {
      bookingId: rawData.id,
      userId: rawData.customerId,
      amount: rawData.price,
      status: rawData.status,
      ipAddress: rawData.metadata.ipAddress,
      userAgent: rawData.metadata.userAgent,
      history: {
        previousCancellations: rawData.customerStats.cancellationCount,
        totalBookings: rawData.customerStats.totalBookingsCount,
      },
      metadata: {}, // AI-specific metadata can be initialized here
      riskScore: 0,  // Initial state for the Agent to populate
    };
  }
}