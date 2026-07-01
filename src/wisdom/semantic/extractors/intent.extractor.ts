// src/wisdom/semantic/extractors/intent.extractor.ts
//
// Determines the user's intent (action) from the message.
// Extracts: AgentAction with confidence
// Does NOT extract entities — those are handled by dedicated extractors.

import { injectable } from "tsyringe";
import { AgentAction } from "../../shared/enums/action.enum";
import { AIDomain } from "../../shared/enums/domain.enum";

export interface IntentResult {
  action: AgentAction;
  confidence: number;
  domain: AIDomain;
}

// Action rules for booking operations (keyword → action mapping)
const BOOKING_ACTION_RULES: { keywords: string[]; action: AgentAction }[] = [
  { keywords: ["confirm booking", "confirm reservation"], action: AgentAction.CONFIRM_BOOKING },
  { keywords: ["cancel booking", "cancel reservation"], action: AgentAction.CANCEL_BOOKING },
  { keywords: ["complete booking", "complete reservation"], action: AgentAction.COMPLETE_BOOKING },
  { keywords: ["get booking", "get reservation"], action: AgentAction.GET_BOOKING },
  { keywords: ["show booking", "show reservation"], action: AgentAction.GET_BOOKING },
];

@injectable()
export class IntentExtractor {
  extract(message: string, context?: { bookingId?: string; listingId?: string }): IntentResult {
    const lower = message.toLowerCase();

    // ── LISTING INTENTS (highest priority, very specific) ──────────────────
    if (lower.includes("optimize") || lower.includes("improve")) {
      if (lower.includes("title")) {
        return { action: AgentAction.OPTIMIZE_TITLE, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("description")) {
        return { action: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("price")) {
        return { action: AgentAction.OPTIMIZE_PRICE, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("category")) {
        return { action: AgentAction.OPTIMIZE_CATEGORY, confidence: 0.99, domain: AIDomain.LISTING };
      }
      return { action: AgentAction.OPTIMIZE_LISTING, confidence: 0.90, domain: AIDomain.LISTING };
    }

    if (lower.includes("seo") || lower.includes("search engine")) {
      return { action: AgentAction.SEO_ANALYSIS, confidence: 0.95, domain: AIDomain.LISTING };
    }

    if (lower.includes("title")) {
      return { action: AgentAction.OPTIMIZE_TITLE, confidence: 0.95, domain: AIDomain.LISTING };
    }

    if (lower.includes("description")) {
      return { action: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.95, domain: AIDomain.LISTING };
    }

    // ── BOOKING INTENTS ─────────────────────────────────────────────────────

    // GET MY BOOKINGS (very specific)
    if (lower.includes("show my bookings") || lower.includes("my bookings")) {
      return { action: AgentAction.GET_MY_BOOKINGS, confidence: 0.99, domain: AIDomain.BOOKING };
    }

    // Booking actions matched by keyword
    for (const rule of BOOKING_ACTION_RULES) {
      if (rule.keywords.some(kw => lower.includes(kw))) {
        return { action: rule.action, confidence: 0.95, domain: AIDomain.BOOKING };
      }
    }

    // CANCEL without "booking" keyword (just "cancel")
    if (lower.includes("cancel")) {
      return { action: AgentAction.CANCEL_BOOKING, confidence: 0.90, domain: AIDomain.BOOKING };
    }

    // CREATE BOOKING ("book" keyword)
    if (lower.includes("book")) {
      return { action: AgentAction.CREATE_BOOKING, confidence: 0.90, domain: AIDomain.BOOKING };
    }

    // ── LISTING SEARCH (broader, lower priority) ────────────────────────────
    if (lower.includes("search") || lower.includes("find") || lower.includes("show") ||
        lower.includes("look") || lower.includes("list")) {
      return { action: AgentAction.SEARCH_LISTING, confidence: 0.80, domain: AIDomain.LISTING };
    }

    // ── GENERAL (fallback) ──────────────────────────────────────────────────
    return { action: AgentAction.GENERAL, confidence: 0.50, domain: AIDomain.GENERAL };
  }
}
