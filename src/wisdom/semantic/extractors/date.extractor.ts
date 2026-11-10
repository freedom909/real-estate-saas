// src/wisdom/semantic/extractors/date.extractor.ts
//
// Extracts CHECK_IN_DATE and CHECK_OUT_DATE entities from the message.
// Handles English and Japanese formats:
//   English: "from 7-15 to 7-18", "next week", "this weekend", "tomorrow"
//   Japanese: "来週", "今週末", "明日", "7月15日から7月18日まで", "7月15日〜7月18日"

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
      ...this.extractJapaneseRelativeDates(message),
      ...this.extractRelativeDates(message),
      ...this.extractCheckIn(message),
      ...this.extractCheckOut(message),
      ...this.extractJapaneseDateRange(message),
      ...this.extractDateRange(message),
    ];
  }

  /**
 * Convert month/day into YYYY-MM-DD.
 * If the date has already passed this year, use next year.
 */
  private resolveMonthDay(month: number, day: number): string | null {
    const now = new Date();
    const year = now.getFullYear();

    const date = new Date(year, month - 1, day);

    // Reject invalid dates such as February 30.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    // If the date has passed, assume next year.
    if (date < new Date(year, now.getMonth(), now.getDate())) {
      date.setFullYear(year + 1);
    }

    return this.fmt(date);
  }

  /**
   * Convert a date range into complete dates.
   * If checkout is earlier than check-in, use the following year.
   */
  private resolveDateRange(
    inMonth: number,
    inDay: number,
    outMonth: number,
    outDay: number,
  ): { checkIn: string; checkOut: string } | null {
    const checkIn = this.resolveMonthDay(inMonth, inDay);
    if (!checkIn) return null;

    const inDate = new Date(`${checkIn}T12:00:00`);

    let outYear = inDate.getFullYear();
    let outDate = new Date(outYear, outMonth - 1, outDay);

    if (
      outDate.getMonth() !== outMonth - 1 ||
      outDate.getDate() !== outDay
    ) {
      return null;
    }

    if (outDate <= inDate) {
      outYear++;
      outDate = new Date(outYear, outMonth - 1, outDay);
    }

    return {
      checkIn,
      checkOut: this.fmt(outDate),
    };
  }

  private fmt(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // ── Japanese relative dates ──────────────────────────────────────────────

  private extractJapaneseRelativeDates(message: string): SemanticEntity[] {
    const now = new Date();
    // 明後日 must be checked before 明日.
    if (/明後日/.test(message)) {
      const dayAfter = new Date(now);
      dayAfter.setDate(now.getDate() + 2);

      const dayAfter2 = new Date(dayAfter);
      dayAfter2.setDate(dayAfter.getDate() + 1);

      return [
        {
          type: EntityType.CHECK_IN_DATE,
          value: this.fmt(dayAfter),
          confidence: 0.90,
        },
        {
          type: EntityType.CHECK_OUT_DATE,
          value: this.fmt(dayAfter2),
          confidence: 0.90,
        },
      ];
    }

    if (/明日/.test(message)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);

      return [
        {
          type: EntityType.CHECK_IN_DATE,
          value: this.fmt(tomorrow),
          confidence: 0.90,
        },
        {
          type: EntityType.CHECK_OUT_DATE,
          value: this.fmt(dayAfter),
          confidence: 0.90,
        },
      ];
    }
    // "明日" (tomorrow)
    if (/明日/.test(message)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(tomorrow), confidence: 0.90 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(dayAfter), confidence: 0.90 },
      ];
    }

    // "明後日" (day after tomorrow)
    if (/明後日/.test(message)) {
      const dayAfter = new Date(now);
      dayAfter.setDate(now.getDate() + 2);
      const dayAfter2 = new Date(dayAfter);
      dayAfter2.setDate(dayAfter.getDate() + 1);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(dayAfter), confidence: 0.90 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(dayAfter2), confidence: 0.90 },
      ];
    }

    // "来週" (next week) → Monday to Sunday
    if (/来週/.test(message)) {
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(nextMonday), confidence: 0.85 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(nextSunday), confidence: 0.85 },
      ];
    }

    // "今週末" (this weekend) → Saturday to Sunday
    if (/今週末/.test(message)) {
      const daysUntilSat = (6 - now.getDay() + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + daysUntilSat);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(saturday), confidence: 0.85 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(sunday), confidence: 0.85 },
      ];
    }

    // "来月" (next month) → 1st to last day of next month
    if (/来月/.test(message)) {
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(nextMonthStart), confidence: 0.80 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(nextMonthEnd), confidence: 0.80 },
      ];
    }

    return [];
  }

  // ── Japanese date range ──────────────────────────────────────────────────

  private extractJapaneseDateRange(message: string): SemanticEntity[] {
    // Pattern:
    // "7月15日から7月18日まで"
    // "7月15日〜7月18日"
    // "7月15日~7月18日"
    // "7月15日から7月18日"

    const jpRangeMatch = message.match(
      /(\d{1,2})月(\d{1,2})日?\s*(?:から|〜|~)\s*(\d{1,2})月(\d{1,2})日?(?:まで)?/
    );

    if (jpRangeMatch) {
      const range = this.resolveDateRange(
        Number(jpRangeMatch[1]),
        Number(jpRangeMatch[2]),
        Number(jpRangeMatch[3]),
        Number(jpRangeMatch[4]),
      );

      if (!range) {
        return [];
      }

      return [
        {
          type: EntityType.CHECK_IN_DATE,
          value: range.checkIn,
          confidence: 0.95,
        },
        {
          type: EntityType.CHECK_OUT_DATE,
          value: range.checkOut,
          confidence: 0.95,
        },
      ];
    }

    // Pattern:
    // "7月15日" (single date → check-in only)

    const jpSingleMatch = message.match(
      /(\d{1,2})月(\d{1,2})日/
    );

    if (jpSingleMatch) {
      const singleDate = this.resolveMonthDay(
        Number(jpSingleMatch[1]),
        Number(jpSingleMatch[2]),
      );

      if (!singleDate) {
        return [];
      }

      return [
        {
          type: EntityType.CHECK_IN_DATE,
          value: singleDate,
          confidence: 0.85,
        },
      ];
    }

    return [];
  }


  // ── English relative dates ───────────────────────────────────────────────

  private extractRelativeDates(message: string): SemanticEntity[] {
    const lower = message.toLowerCase();
    const now = new Date();

    if (/\bnext\s+week\b/.test(lower)) {
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
      const nextSunday = new Date(nextMonday);
      nextSunday.setDate(nextMonday.getDate() + 6);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(nextMonday), confidence: 0.85 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(nextSunday), confidence: 0.85 },
      ];
    }

    if (/\bthis\s+weekend\b/.test(lower)) {
      const daysUntilSat = (6 - now.getDay() + 7) % 7;
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + daysUntilSat);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(saturday), confidence: 0.85 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(sunday), confidence: 0.85 },
      ];
    }

    if (/\btomorrow\b/.test(lower)) {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(tomorrow.getDate() + 1);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(tomorrow), confidence: 0.85 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(dayAfter), confidence: 0.85 },
      ];
    }

    if (/\bnext\s+month\b/.test(lower)) {
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return [
        { type: EntityType.CHECK_IN_DATE, value: this.fmt(nextMonthStart), confidence: 0.80 },
        { type: EntityType.CHECK_OUT_DATE, value: this.fmt(nextMonthEnd), confidence: 0.80 },
      ];
    }

    return [];
  }

  // ── English date range ───────────────────────────────────────────────────

  private extractDateRange(message: string): SemanticEntity[] {
    // "from 7-15 to 7-18" or "from 7/15 to 7/18"
    const numericMatch = message.match(
      /from\s+(\d{1,2}[-/]\d{1,2})\s+to\s+(\d{1,2}[-/]\d{1,2})/i,
    );
    if (numericMatch) {
      return [
        { type: EntityType.CHECK_IN_DATE, value: numericMatch[1], confidence: 0.95 },
        { type: EntityType.CHECK_OUT_DATE, value: numericMatch[2], confidence: 0.95 },
      ];
    }

    // "from July 5 to July 10"
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

    // "July 5-10" or "July 5 ~ 10" or "7/5-7/10"
    const compactMonthMatch = message.match(
      /([A-Za-z]+)\s+(\d{1,2})\s*[-~]\s*(\d{1,2})/i,
    );
    if (compactMonthMatch) {
      const month = MONTH_MAP[compactMonthMatch[1].toLowerCase()] ?? compactMonthMatch[1];
      const inDay = compactMonthMatch[2].padStart(2, "0");
      const outDay = compactMonthMatch[3].padStart(2, "0");
      return [
        { type: EntityType.CHECK_IN_DATE, value: `${month}-${inDay}`, confidence: 0.90 },
        { type: EntityType.CHECK_OUT_DATE, value: `${month}-${outDay}`, confidence: 0.90 },
      ];
    }

    // "5-10" or "5/10" (bare numeric range, assume same month)
    const bareNumericMatch = message.match(
      /\b(\d{1,2})\s*[-/]\s*(\d{1,2})\b/,
    );
    if (bareNumericMatch) {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const inDay = bareNumericMatch[1].padStart(2, "0");
      const outDay = bareNumericMatch[2].padStart(2, "0");
      // Only use if it looks like a date range (not a year or other number)
      if (parseInt(inDay) <= 31 && parseInt(outDay) <= 31 && parseInt(inDay) < parseInt(outDay)) {
        return [
          { type: EntityType.CHECK_IN_DATE, value: `${month}-${inDay}`, confidence: 0.75 },
          { type: EntityType.CHECK_OUT_DATE, value: `${month}-${outDay}`, confidence: 0.75 },
        ];
      }
    }

    return [];
  }

  // ── English check-in / check-out ─────────────────────────────────────────
  private parseExplicitDate(value: string): string | null {
    const now = new Date();
    const currentYear = now.getFullYear();

    // YYYY-MM-DD or YYYY/MM/DD
    let match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

    let year: number;
    let month: number;
    let day: number;

    if (match) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
    } else {
      // MM-DD or MM/DD
      match = value.match(/^(\d{1,2})[-/](\d{1,2})$/);

      if (!match) return null;

      year = currentYear;
      month = Number(match[1]);
      day = Number(match[2]);
    }

    const date = new Date(year, month - 1, day);

    // Reject invalid dates such as 2026-02-30
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return this.fmt(date);
  }

  private extractCheckIn(message: string): SemanticEntity[] {
    const match = message.match(
      /check[\s-]?in\s+(?:on\s+)?(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2})/i
    );

    if (!match) return [];

    const date = this.parseExplicitDate(match[1]);

    if (!date) return [];

    return [{
      type: EntityType.CHECK_IN_DATE,
      value: date,
      confidence: 0.95,
    }];
  }

  private extractCheckOut(message: string): SemanticEntity[] {
    const match = message.match(
      /check[\s-]?out\s+(?:on\s+)?(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2})/i
    );

    if (!match) return [];

    const date = this.parseExplicitDate(match[1]);

    if (!date) return [];

    return [{
      type: EntityType.CHECK_OUT_DATE,
      value: date,
      confidence: 0.95,
    }];
  }
}
