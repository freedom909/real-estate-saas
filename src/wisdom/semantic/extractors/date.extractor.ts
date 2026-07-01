// src/wisdom/semantic/extractors/date.extractor.ts
//
// Extracts CHECK_IN_DATE and CHECK_OUT_DATE entities from the message.
// Handles formats:
//   "from 7-15 to 7-18" → CHECK_IN_DATE="7-15", CHECK_OUT_DATE="7-18"
//   "from 7/15 to 7/18" → CHECK_IN_DATE="7/15", CHECK_OUT_DATE="7/18"
//   "from July 7 to July 10" → CHECK_IN_DATE="07-07", CHECK_OUT_DATE="07-10"
//   "check-in on 2024-07-15" → CHECK_IN_DATE="2024-07-15"
//   "check-out 2024-07-18" → CHECK_OUT_DATE="2024-07-18"

import { injectable } from "tsyringe";
import { SemanticEntity } from "../semantic.entity";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { ISemanticEntityExtractor } from "./entity-extractor.interface";

const MONTH_MAP: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12",
};

@injectable()
export class DateExtractor implements ISemanticEntityExtractor {
  extract(message: string): SemanticEntity[] {
    return [
      ...this.extractDateRange(message),
      ...this.extractCheckIn(message),
      ...this.extractCheckOut(message),
    ];
  }

  /** "from 7-15 to 7-18", "from July 7 to July 10" → CHECK_IN_DATE + CHECK_OUT_DATE */
  private extractDateRange(message: string): SemanticEntity[] {
    // Pattern 1: "from M-D to M-D" or "from M/D to M/D" (numeric)
    const numericMatch = message.match(
      /from\s+(\d{1,2}[-/]\d{1,2})\s+to\s+(\d{1,2}[-/]\d{1,2})/i,
    );
    if (numericMatch) {
      return [
        { type: EntityType.CHECK_IN_DATE, value: numericMatch[1], confidence: 0.95 },
        { type: EntityType.CHECK_OUT_DATE, value: numericMatch[2], confidence: 0.95 },
      ];
    }

    // Pattern 2: "from MonthName Day to MonthName Day" (e.g. "from July 7 to July 10")
    const monthMatch = message.match(
      /from\s+([A-Za-z]+)\s+(\d{1,2})\s+to\s+([A-Za-z]+)\s+(\d{1,2})/i,
    );
    if (monthMatch) {
      const inMonth = MONTH_MAP[monthMatch[1].toLowerCase()] ?? monthMatch[1];
      const outMonth = MONTH_MAP[monthMatch[3].toLowerCase()] ?? monthMatch[3];
      const inDay = monthMatch[2].padStart(2, "0");
      const outDay = monthMatch[4].padStart(2, "0");
      return [
        { type: EntityType.CHECK_IN_DATE, value: `${inMonth}-${inDay}`, confidence: 0.95 },
        { type: EntityType.CHECK_OUT_DATE, value: `${outMonth}-${outDay}`, confidence: 0.95 },
      ];
    }

    return [];
  }

  /** "check-in on 2024-07-15", "checkin 7/15" → CHECK_IN_DATE */
  private extractCheckIn(message: string): SemanticEntity[] {
    const match = message.match(/check[\s-]?in\s+(?:on\s+)?(\d{1,4}[-/]\d{1,2}[-/]?\d{0,2})/i);
    if (match) {
      return [{ type: EntityType.CHECK_IN_DATE, value: match[1], confidence: 0.95 }];
    }
    return [];
  }

  /** "check-out on 2024-07-18", "checkout 7/18" → CHECK_OUT_DATE */
  private extractCheckOut(message: string): SemanticEntity[] {
    const match = message.match(/check[\s-]?out\s+(?:on\s+)?(\d{1,4}[-/]\d{1,2}[-/]?\d{0,2})/i);
    if (match) {
      return [{ type: EntityType.CHECK_OUT_DATE, value: match[1], confidence: 0.95 }];
    }
    return [];
  }
}
