// src/wisdom/agents/booking/dto/booking-to-voice.dto.ts

/**
 * Voice-facing booking data.
 * Only contains what the user needs to hear — no IDs, no internal fields.
 */
export interface BookingToVoiceDTO {
  listingName: string;
  checkInDate: string;    // formatted, e.g. "8月17日"
  checkOutDate: string;   // formatted, e.g. "8月23日"
  priceText: string;      // formatted, e.g. "42,000円"
  statusText: string;     // Japanese status, e.g. "確認待ち"
  /** Only present when user explicitly asked for reservation number */
  reservationNumber?: string;
  /** Action verb prefix — "確認", "キャンセル", "確定", "完了" */
  action?: string;
}
