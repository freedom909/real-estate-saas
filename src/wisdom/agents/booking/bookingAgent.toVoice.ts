// src/wisdom/agents/booking/bookingAgent.toVoice.ts
//
// Legacy adapter — kept for backward compatibility.
// Prefer using BookingVoiceMapper directly in handlers.

import { AIContext } from "@/wisdom/contracts/ai-context";
import { BookingVoiceMapper, BookingVoiceInput } from "./bookingPresentation/voice.mapper";

export class BookingAgentToVoice {
  /**
   * Convert a raw booking JSON + context into a voice DTO.
   * Use this when you have a toJSON() plain object, not a Booking entity.
   */
  static fromBookingJson(
    bookingJson: Record<string, any>,
    context: AIContext,
  ) {
    const listing = context.resources?.searchResults?.find(
      (item: any) => item.id === bookingJson.listingId,
    );

    const input: BookingVoiceInput = {
      listingName: listing?.title ?? "ご宿泊先",
      price: bookingJson.price,
      checkInDate: new Date(bookingJson.dateRange?.checkInDate),
      checkOutDate: new Date(bookingJson.dateRange?.checkOutDate),
      status: bookingJson.status,
    };

    return BookingVoiceMapper.toVoice(input);
  }
}
