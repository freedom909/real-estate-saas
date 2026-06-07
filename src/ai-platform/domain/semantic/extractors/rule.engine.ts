// RULE ENGINE

import { injectable } from "tsyringe";
import { RuleMatch } from "../types/rule.match";
import { AIDomain } from "../types/ai.domain";

@injectable()
export class RuleEngine {

  match(message: string): RuleMatch {

    const lower = message.toLowerCase();

    // ===== BOOKING RULE =====
    if (lower.includes("cancel booking")) {
      return {
        matched: true,
        intent: "CANCEL_BOOKING",
        domain: AIDomain.BOOKING,
        confidence: 0.99,
        reason: "keyword: cancel booking"
      };
    }

    // ===== LISTING RULE =====
    if (lower.includes("title")) {
      return {
        matched: true,
        intent: "OPTIMIZE_TITLE",
        domain: AIDomain.LISTING,
        action: "optimize_title",
        confidence: 0.99,
        reason: "keyword: title"
      };
    }

    if (lower.includes("description")) {
      return {
        matched: true,
        intent: "OPTIMIZE_DESCRIPTION",
        domain: AIDomain.LISTING,
        confidence: 0.99,
        reason: "keyword: description"
      };
    }

    return {
      matched: false,
      confidence: 0
    };
  }
}