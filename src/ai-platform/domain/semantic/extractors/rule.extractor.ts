//

import { injectable } from "tsyringe";
import {  AgentAction, EntityType, SemanticContext } from "../semantic-context";
import { AIDomain } from "../types/ai.domain";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";

const UUID_REGEX =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@injectable()
export class RuleExtractor {

  async extract(
    request: AIRequest
  ): Promise<SemanticContext> {

    const message = request?.message ?? "";
    console.log("message:", message);
    const lower = message.toLowerCase();

    // ----------------------------------
    // BOOKING CANCEL
    // ----------------------------------
    if (lower.includes("cancel")) {
      let entities: { type: EntityType; value: string }[] = [];

      // Extract booking ID from message text first
      const cancelBookingId = message.match(UUID_REGEX)?.[0];
      if (cancelBookingId) {
        entities.push({ type: EntityType.BOOKING_ID, value: cancelBookingId });
      }

      // Fallback: populate booking_id from context resources if available
      if (!cancelBookingId && request.context.resources?.bookingId) {
        entities.push({ type: EntityType.BOOKING_ID, value: request.context.resources.bookingId });
      }

      return new SemanticContext(
        message,
        entities,
        {
          type: AgentAction.CANCEL_BOOKING,
          confidence: 0.99
        },
        0.99,
        AIDomain.BOOKING,
        true
      );
    }

    // ----------------------------------
    // LISTING RULES
    // ----------------------------------
    let listingIdFromMessage: string | undefined;
    const entities: { type: EntityType; value: string }[] = [];

    const listingMatch =
      message.match(
        /listingid\s*=\s*([a-zA-Z0-9-]+)/i
      );

    if (listingMatch) {
      listingIdFromMessage = listingMatch[1];
      entities.push({
        type: EntityType.LISTING_ID,
        value: listingIdFromMessage
      });
    }

    if (lower.includes("title")) {
      // If listingId is not found in the message, try to get it from context resources
      if (!listingIdFromMessage && request.context.resources?.listingId) {
        entities.push({ type: EntityType.LISTING_ID, value: request.context.resources.listingId });
      }

      return new SemanticContext(
        message,
        entities,
        {
          type: "OPTIMIZE_TITLE" as AgentAction,
          confidence: 0.99
        },
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    if (lower.includes("description")) {
      // If listingId is not found in the message, try to get it from context resources
      if (!listingIdFromMessage && request.context.resources?.listingId) {
        entities.push({ type: EntityType.LISTING_ID, value: request.context.resources.listingId });
      }

      return new SemanticContext(
        message,
        entities,
        {
          type: "OPTIMIZE_DESCRIPTION" as AgentAction,
          confidence: 0.99,
        },
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    // Default: no rule matched
    return new SemanticContext(message, [], null, 0, AIDomain.UNKNOWN, false);
  }
}
