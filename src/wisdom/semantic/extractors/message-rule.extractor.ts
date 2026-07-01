// src/wisdom/semantic/extractors/message-rule.extractor.ts
//
// Three responsibilities, one class:
//   extractEntities(message)  → SemanticEntity[]   (what data did the user provide?)
//   detectAction(message, entities) → SemanticAction | null (what does the user want to do?)
//   extract(message)          → SemanticContext | null       (orchestrator — calls above two)

import { injectable } from "tsyringe";
import { AgentAction, SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { SemanticEntity } from "../semantic.entity";

// ── Constants ───────────────────────────────────────────────────────────────

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const ORDINAL_MAP: Record<string, string> = {
  "first": "first", "1st": "first",
  "second": "second", "2nd": "second",
  "third": "third", "3rd": "third",
  "last": "last", "latest": "latest",
};

const BOOKING_ACTION_RULES: { keywords: string[]; action: AgentAction }[] = [
  { keywords: ["confirm booking", "confirm reservation"], action: AgentAction.CONFIRM_BOOKING },
  { keywords: ["cancel booking", "cancel reservation"], action: AgentAction.CANCEL_BOOKING },
  { keywords: ["complete booking", "complete reservation"], action: AgentAction.COMPLETE_BOOKING },
  { keywords: ["get booking", "get reservation"], action: AgentAction.GET_BOOKING },
  { keywords: ["show booking", "show reservation"], action: AgentAction.GET_BOOKING },
];

// ── MessageRuleExtractor ────────────────────────────────────────────────────

@injectable()
export class MessageRuleExtractor {

  // =========================================================================
  // 1. extractEntities — "What data did the user give me?"
  // =========================================================================

  extractEntities(message: string): SemanticEntity[] {
    return [
      // ...this.extractDateRange(message),
      ...this.extractGuestCount(message),
      ...this.extractContactName(message),
      ...this.extractSpecialRequest(message),
      ...this.extractOrdinal(message),
    ];
  }

  // =========================================================================
  // 2. detectAction — "What does the user want to do?"
  // =========================================================================

  detectAction(
    message: string,
    entities: SemanticEntity[],
  ): { type: AgentAction; confidence: number } | null {
    const lower = message.toLowerCase();
    const hasBookingId = entities.some(e => e.type === EntityType.BOOKING_ID);
    const ordinalEntities = entities.filter(e => e.type === EntityType.ORDINAL);
    const hasOrdinals = ordinalEntities.length > 0;

    // ── GET MY BOOKINGS ────────────────────────────────────────────────────
    if (lower.includes("show my bookings") || lower.includes("my bookings")) {
      return { type: AgentAction.GET_MY_BOOKINGS, confidence: 0.99 };
    }

    // ── Booking actions matched by keyword + ID type ───────────────────────
    for (const rule of BOOKING_ACTION_RULES) {
      if (!rule.keywords.some(kw => lower.includes(kw))) continue;

      // With UUID → highest confidence
      if (hasBookingId) {
        return { type: rule.action, confidence: 0.95 };
      }
      // With ordinal → good confidence (needs reference resolution)
      if (hasOrdinals) {
        return { type: rule.action, confidence: 0.90 };
      }
      // Keyword only → will need reference resolution
      return { type: rule.action, confidence: 0.85 };
    }

    // ── CREATE BOOKING with ordinal ("book the first one") ─────────────────
    if (lower.includes("book") && hasOrdinals) {
      return { type: AgentAction.CREATE_BOOKING, confidence: 0.95 };
    }

    // ── CREATE BOOKING generic ("book this place") ─────────────────────────
    if (lower.includes("book") && !lower.includes("booking")) {
      return { type: AgentAction.CREATE_BOOKING, confidence: 0.90 };
    }

    return null;
  }

  // =========================================================================
  // 3. extract — orchestrator
  // =========================================================================

  extract(message: string): SemanticContext | null {
    const entities = this.extractEntities(message);
    const action = this.detectAction(message, entities);

    if (!action) return null;

    return new SemanticContext(
      message,
      entities,
      { type: action.type, confidence: action.confidence },
      action.confidence,
      AIDomain.BOOKING,
      true,
    );
  }

  // =========================================================================
  // Private extractors — each owns one entity type
  // =========================================================================

  /** "from 7-15 to 7-18", "from July 7 to July 10", "from 7/15 to 7/18" → CHECK_IN_DATE + CHECK_OUT_DATE */
  // private extractDateRange(message: string): SemanticEntity[] {
  //   // Pattern 1: "from M-D to M-D" or "from M/D to M/D" (numeric)
  //   const numericMatch = message.match(
  //     /from\s+(\d{1,2}[-/]\d{1,2})\s+to\s+(\d{1,2}[-/]\d{1,2})/i,
  //   );
  //   if (numericMatch) {
  //     return [
  //       { type: EntityType.CHECK_IN_DATE, value: numericMatch[1], confidence: 0.95 },
  //       { type: EntityType.CHECK_OUT_DATE, value: numericMatch[2], confidence: 0.95 },
  //     ];
  //   }

  //   // Pattern 2: "from MonthName Day to MonthName Day" (e.g. "from July 7 to July 10")
  //   const monthMatch = message.match(
  //     /from\s+([A-Za-z]+)\s+(\d{1,2})\s+to\s+([A-Za-z]+)\s+(\d{1,2})/i,
  //   );
  //   if (monthMatch) {
  //     const monthMap: Record<string, string> = {
  //       january: "01", february: "02", march: "03", april: "04",
  //       may: "05", june: "06", july: "07", august: "08",
  //       september: "09", october: "10", november: "11", december: "12",
  //     };
  //     const inMonth = monthMap[monthMatch[1].toLowerCase()] ?? monthMatch[1];
  //     const outMonth = monthMap[monthMatch[3].toLowerCase()] ?? monthMatch[3];
  //     const inDay = monthMatch[2].padStart(2, "0");
  //     const outDay = monthMatch[4].padStart(2, "0");
  //     return [
  //       { type: EntityType.CHECK_IN_DATE, value: `${inMonth}-${inDay}`, confidence: 0.95 },
  //       { type: EntityType.CHECK_OUT_DATE, value: `${outMonth}-${outDay}`, confidence: 0.95 },
  //     ];
  //   }

  //   return [];
  // }

  /** "2 guests", "3 people" → GUEST_COUNT */
  private extractGuestCount(message: string): SemanticEntity[] {
    const match = message.match(/(\d+)\s*(guests?|people|person|人)/i);
    if (!match) return [];

    return [{ type: EntityType.GUEST_COUNT, value: parseInt(match[1], 10), confidence: 0.95 }];
  }

  /** "contact: John Smith", "name: Tanaka" → CONTACT_NAME (future extensibility) */
  private extractContactName(_message: string): SemanticEntity[] {
    // TODO: implement when booking form patterns are defined
    return [];
  }

  /** "vegetarian meal", "non-smoking room" → SPECIAL_REQUEST (future extensibility) */
  private extractSpecialRequest(_message: string): SemanticEntity[] {
    // TODO: implement when special request vocabulary is defined
    return [];
  }

  /** "first", "second", "last" → ORDINAL */
  private extractOrdinal(message: string): SemanticEntity[] {
    const lower = message.toLowerCase();

    for (const [keyword, value] of Object.entries(ORDINAL_MAP)) {
      if (lower.includes(keyword)) {
        return [{ type: EntityType.ORDINAL, value, confidence: 0.95 }];
      }
    }
    return [];
  }
}
