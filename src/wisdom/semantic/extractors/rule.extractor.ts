// src/wisdom/semantic/extractors/rule.extractor.ts

import { injectable } from "tsyringe";
import { AgentAction, SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { WisdomRequest } from "../../contracts/request";

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@injectable()
export class RuleExtractor {
  async extract(request: WisdomRequest): Promise<SemanticContext> {
    const message = request?.message ?? "";
    const lower = message.toLowerCase();

    // BOOKING CANCEL
    if (lower.includes("cancel")) {
      const entities: { type: EntityType; value: string }[] = [];
      const cancelBookingId = message.match(UUID_REGEX)?.[0];
      if (cancelBookingId) {
        entities.push({ type: EntityType.BOOKING_ID, value: cancelBookingId });
      }
      if (!cancelBookingId && request.context.resources?.bookingId) {
        entities.push({ type: EntityType.BOOKING_ID, value: request.context.resources.bookingId });
      }
      return new SemanticContext(
        message, entities,
        { type: AgentAction.CANCEL_BOOKING, confidence: 0.99 },
        0.99, AIDomain.BOOKING, true
      );
    }

    // LISTING RULES
    let listingIdFromMessage: string | undefined;
    const entities: { type: EntityType; value: string }[] = [];
    const listingMatch = message.match(/listingid\s*=\s*([a-zA-Z0-9-]+)/i);
    if (listingMatch) {
      listingIdFromMessage = listingMatch[1];
      entities.push({ type: EntityType.LISTING_ID, value: listingIdFromMessage });
    }

    if (lower.includes("title")) {
      if (!listingIdFromMessage && request.context.resources?.listingId) {
        entities.push({ type: EntityType.LISTING_ID, value: request.context.resources.listingId });
      }
      return new SemanticContext(
        message, entities,
        { type: AgentAction.OPTIMIZE_TITLE, confidence: 0.99 },
        0.99, AIDomain.LISTING, true
      );
    }

    if (lower.includes("description")) {
      if (!listingIdFromMessage && request.context.resources?.listingId) {
        entities.push({ type: EntityType.LISTING_ID, value: request.context.resources.listingId });
      }
      return new SemanticContext(
        message, entities,
        { type: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.99 },
        0.99, AIDomain.LISTING, true
      );
    }

    return new SemanticContext(message, [], null, 0, AIDomain.UNKNOWN, false);
  }
}
