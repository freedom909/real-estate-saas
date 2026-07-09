import { inject, injectable } from "tsyringe";

import { BookingAIContext } from "./bookingAI.context";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { BookingGateway } from "@/core/booking/bookingGateway";

@injectable()
export class BookingACL {
  constructor(
    @inject(TOKENS_BOOKING.gateway.bookingGateway)
    private gateway: BookingGateway
  ) {}

  async getContext(bookingId: string): Promise<BookingAIContext> {
    const rawData = await this.gateway.fetchBookingData(bookingId);

    return {
      bookingId: rawData.id,
      userId: rawData.customerId,
      amount: rawData.price,
      status: rawData.status,
      metadata: {}
    };
  }
}