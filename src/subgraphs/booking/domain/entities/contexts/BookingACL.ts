import { inject, injectable } from "tsyringe";

import { BookingAIContext } from "./bookingAIContext";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

@injectable()
export class BookingACL {
  constructor(
    
  ) {}

  async getContext(bookingId: string): Promise<BookingAIContext> {
    const rawData = await this.gateway.fetchBookingData(bookingId);

    return {
      bookingId: rawData.id,
      userId: rawData.guestId,
      amount: rawData.price,
      status: rawData.state,
      ipAddress: rawData.security.ip,
      history: { previousCancellations: rawData.stats.cancels, totalBookings: rawData.stats.total },
      metadata: {}
    };
  }
}