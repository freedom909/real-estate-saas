// src/wisdom/agents/booking/bookingPresentation/voice.mapper.ts
//
// BookingVoiceMapper — converts Booking entity → natural Japanese voice text.
//
// Design principle:
//   toView()  = complete, actionable, technical (for UI)
//   toVoice() = only what the user needs to hear right now (for AI voice / chat)
//
// Rules:
//   1. Always include price
//   2. Booking ID only when explicitly asked
//   3. Always include check-in / check-out
//   4. Always include status

import { BookingToVoiceDTO } from "../dto/booking-to-voice.dto";

export interface BookingVoiceInput {
  /** Listing title, e.g. "渋谷のマンション" */
  listingName: string;
  /** Total price as number (JPY) */
  price: number;
  /** Check-in date */
  checkInDate: Date;
  /** Check-out date */
  checkOutDate: Date;
  /** Booking status string, e.g. "PENDING", "CONFIRMED" */
  status: string;
  /** Optional — only included when user asked for it */
  reservationNumber?: string;
  /** Action verb prefix — defaults to "確認" (confirmed) */
  action?: "確認" | "キャンセル" | "確定" | "完了";
}

export class BookingVoiceMapper {

  // ─── toVoice: natural Japanese sentence ────────────────────────

  static toVoice(input: BookingVoiceInput): BookingToVoiceDTO {
    return {
      listingName: input.listingName,
      checkInDate: this.formatDate(input.checkInDate),
      checkOutDate: this.formatDate(input.checkOutDate),
      priceText: this.formatPrice(input.price),
      statusText: this.formatStatus(input.status),
      reservationNumber: input.reservationNumber, // only set when asked
      action: input.action ?? "確認",
    };
  }

  /**
   * Build a natural Japanese sentence from the DTO.
   * This is what the user actually hears / reads.
   *
   * Examples:
   *   予約を確認しました！8月17日から8月23日まで、「渋谷のマンション」、合計42,000円、予約状況：確認待ち。
   *   予約を確認しました！8月17日から8月23日まで、「渋谷のマンション」、合計42,000円、予約状況：確認待ち。予約番号：abc-123。
   */
  static toSentence(dto: BookingToVoiceDTO): string {
    const parts: string[] = [];

    // 1. Check-in → Check-out
    parts.push(`${dto.checkInDate}から${dto.checkOutDate}まで`);

    // 2. Listing name
    parts.push(`「${dto.listingName}」`);

    // 3. Price (always included)
    parts.push(`合計${dto.priceText}`);

    // 4. Status
    parts.push(`予約状況：${dto.statusText}`);

    // 5. Reservation number — ONLY when present (user asked for it)
    if (dto.reservationNumber) {
      parts.push(`予約番号：${dto.reservationNumber}`);
    }

    const action = dto.action ?? "確認";
    return `ご予約を${action}しました。${parts.join("、")}。`;
  }

  // ─── Formatting helpers ────────────────────────────────────────

  private static formatDate(date: Date): string {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "long",
      day: "numeric",
    }).format(date);
  }

  private static formatPrice(amount: number): string {
    return `${amount.toLocaleString("ja-JP")}円`;
  }

  private static formatStatus(status: string): string {
    switch (status) {
      case "PENDING":    return "確認待ち";
      case "CONFIRMED":  return "予約確定";
      case "CANCELLED":  return "キャンセル済み";
      case "COMPLETED":  return "利用完了";
      case "CHECKED_IN":  return "チェックイン済み";
      default:           return status;
    }
  }
}
