//src

import { AIDomain } from "../types/ai.domain";
import { IntentDecision } from "./intent.decision";


export class IntentGateway {

  public match(
    message: string
  ): IntentDecision | null {

    const lower =
      message.toLowerCase();

    if (lower.includes("show my bookings")) {
      return {
        matched: true,
        domain: AIDomain.BOOKING,
        action: "get_my_bookings",
        confidence: 0.99,
        reason: "keyword"
      };
    }

    if (lower.includes("cancel booking")) {
      return {
        matched: true,
        domain: AIDomain.BOOKING,
        action: "cancel_booking",
        confidence: 0.99,
        reason: "keyword"
      };
    }

    return null;
  }
}