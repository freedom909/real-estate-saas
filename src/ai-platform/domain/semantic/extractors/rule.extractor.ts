//

import { injectable } from "tsyringe";
import {  AgentAction, EntityType, SemanticContext } from "../semantic-context";
import { AIDomain } from "../types/ai.domain";
import { AIRequest } from "@/ai-platform/context/types/context/ai.context";


@injectable()
export class RuleExtractor {

  async extract(
    request: AIRequest // request seems to have no its use
  ): Promise<SemanticContext> {

    const message = request?.message ?? "";
    console.log("message:", message);
    const lower = message.toLowerCase();

    if (lower.includes("cancel")) {
      const entities = [];
      // Populate booking_id from context resources if available
      if (request.context.resources?.bookingId) {
        entities.push({ type: EntityType.BOOKING_ID, value: request.context.resources.bookingId });
      }
      return new SemanticContext(
        message,
        entities,
        null,
        0.99,
        AIDomain.BOOKING,
        true
      );
    }

    let listingIdFromMessage: string | undefined;
    const entities = [];

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

    // どのルールにも合致しない場合のデフォルトの戻り値
    return new SemanticContext(message, [], null, 0, AIDomain.UNKNOWN, false);
  }
}
