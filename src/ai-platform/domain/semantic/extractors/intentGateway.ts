//src

import { AIDomain } from "../types/ai.domain";
import { IntentDecision } from "./intent.decision";


export class IntentGateway {

  public match(
    message: string
  ): IntentDecision | null {
    const bookingIdRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const lower =
      message.toLowerCase();
    const bookingId =
      message.match(bookingIdRegex)?.[0];
    if (
      lower.includes("confirm booking") &&
      bookingId
    ) {
      return {
        matched: true,
        primaryAction: "confirm_booking",
        domain: AIDomain.BOOKING,
        confidence: 0.99,
        reason: "rule: confirm booking",

      };
    }


    if (lower.includes("show my bookings")) {
      return {
        matched: true,
        domain: AIDomain.BOOKING,
        primaryAction: "get_my_bookings",
        confidence: 0.99,
        reason: "keyword"
      };
    }

    if (lower.includes("cancel booking")) {
      return {
        matched: true,
        domain: AIDomain.BOOKING,
        primaryAction: "cancel_booking",
        confidence: 0.99,
        reason: "keyword"
      };
    }

    return null;
  }
}