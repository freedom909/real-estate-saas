// src/wisdom/semantic/extractors/message-rule.extractor.ts

import { injectable } from "tsyringe";
import { AgentAction, Entity, SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

@injectable()
export class MessageRuleExtractor {
  private readonly bookingRules = [
    { keywords: ["confirm booking", "confirm reservation"], action: AgentAction.CONFIRM_BOOKING },
    { keywords: ["cancel booking", "cancel reservation"], action: AgentAction.CANCEL_BOOKING },
    { keywords: ["complete booking", "complete reservation"], action: AgentAction.COMPLETE_BOOKING },
    { keywords: ["get booking", "get reservation"], action: AgentAction.GET_BOOKING },
    { keywords: ["show booking", "show reservation"], action: AgentAction.GET_BOOKING },
  ];

  extract(message: string): SemanticContext | null {
    const lower = message.toLowerCase();
    const bookingId = message.match(UUID_REGEX)?.[0];
    const ordinalEntities = this.extractOrdinal(message);

    // GET MY BOOKINGS
    if (lower.includes("show my bookings") || lower.includes("my bookings")) {
      return new SemanticContext(
        message, [],
        { type: AgentAction.GET_MY_BOOKINGS, confidence: 0.99 },
        0.99, AIDomain.BOOKING, true
      );
    }

    // BOOKING ACTIONS (with UUID)
    for (const rule of this.bookingRules) {
      if (rule.keywords.some(keyword => lower.includes(keyword)) && bookingId) {
        return this.buildBookingIntent(message, rule.action, [
          { type: EntityType.BOOKING_ID, value: bookingId },
        ]);
      }
    }

    // BOOKING ACTIONS (with ORDINAL, no UUID)
    if (ordinalEntities.length > 0) {
      for (const rule of this.bookingRules) {
        if (rule.keywords.some(keyword => lower.includes(keyword))) {
          return this.buildBookingIntent(message, rule.action, ordinalEntities);
        }
      }
    }

    // BOOKING ACTIONS (keyword only, no ID — will need reference resolution)
    for (const rule of this.bookingRules) {
      if (rule.keywords.some(keyword => lower.includes(keyword))) {
        return this.buildBookingIntent(message, rule.action, []);
      }
    }

    // BOOK THE FIRST ONE / BOOK THE SECOND ONE
    if (lower.includes("book") && ordinalEntities.length > 0) {
      return new SemanticContext(
        message, ordinalEntities,
        { type: AgentAction.CREATE_BOOKING, confidence: 0.95 },
        0.95, AIDomain.BOOKING, true
      );
    }

    // CREATE BOOKING
    if (lower.includes("book") && !lower.includes("booking")) {
      return new SemanticContext(
        message, [],
        { type: AgentAction.CREATE_BOOKING, confidence: 0.90 },
        0.90, AIDomain.BOOKING, true
      );
    }

    return null;
  }

  private extractOrdinal(message: string): Entity[] {
    const lower = message.toLowerCase();
    const ordinals: Record<string, string> = {
      "first": "first", "1st": "first",
      "second": "second", "2nd": "second",
      "third": "third", "3rd": "third",
      "last": "last", "latest": "latest",
    };

    for (const [keyword, value] of Object.entries(ordinals)) {
      if (lower.includes(keyword)) {
        return [{ type: EntityType.ORDINAL, value }];
      }
    }
    return [];
  }

  private buildBookingIntent(
    message: string,
    action: AgentAction,
    entities: Entity[]
  ): SemanticContext {
    return new SemanticContext(
      message, entities,
      { type: action, confidence: 0.95 },
      0.95, AIDomain.BOOKING, true
    );
  }
}
