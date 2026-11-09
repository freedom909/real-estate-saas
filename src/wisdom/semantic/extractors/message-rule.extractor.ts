// src/wisdom/semantic/extractors/message-rule.extractor.ts
//
// Three responsibilities, one class:
//   extractEntities(message)  → SemanticEntity[]   (what data did the user provide?)
//   detectAction(message, entities) → SemanticAction | null (what does the user want to do?)
//   extract(message)          → SemanticContext | null       (orchestrator — calls above two)

import { injectable } from "tsyringe";
import {  SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { SemanticEntity } from "../semantic.entity";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";

// ── Constants ───────────────────────────────────────────────────────────────

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const ORDINAL_MAP: Record<string, string> = {
  // English
  first: "first",
  "1st": "first",
  second: "second",
  "2nd": "second",
  third: "third",
  "3rd": "third",
  fourth: "fourth",
  "4th": "fourth",
  fifth: "fifth",
  "5th": "fifth",
  last: "last",
  latest: "latest",

  // Japanese: first
  "一番目": "first",
  "1番目": "first",
  "１番目": "first",
  "一つ目": "first",
  "ひとつ目": "first",
  "1つ目": "first",
  "１つ目": "first",
  "最初": "first",
  "最初の": "first",
  "一件目": "first",
  "1件目": "first",
  "１件目": "first",
  "一軒目": "first",
  "一つめ": "first",

  // Japanese: second
  "二番目": "second",
  "2番目": "second",
  "２番目": "second",
  "二つ目": "second",
  "ふたつ目": "second",
  "2つ目": "second",
  "２つ目": "second",
  "二件目": "second",
  "2件目": "second",
  "２件目": "second",
  "二軒目": "second",
  "二つめ": "second",

  // Japanese: third
  "三番目": "third",
  "3番目": "third",
  "３番目": "third",
  "三つ目": "third",
  "みっつ目": "third",
  "3つ目": "third",
  "３つ目": "third",
  "三件目": "third",
  "3件目": "third",
  "三軒目": "third",

  // Japanese: fourth
  "四番目": "fourth",
  "4番目": "fourth",
  "四つ目": "fourth",
  "四件目": "fourth",

  // Japanese: fifth
  "五番目": "fifth",
  "5番目": "fifth",
  "五つ目": "fifth",
  "五件目": "fifth",

  // Last / latest
  "最後": "last",
  "最後の": "last",
  "一番最後": "last",
  "末尾": "last",
  "最新": "latest",
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
/**
 * Detect whether the user is selecting a listing.
 *
 * Examples:
 * 二番目の方はいいです
 * こちらにします
 * これをお願いします
 * そのホテルが気に入りました
 * それに決めます
 */
private isListingSelection(message: string): boolean {
  const patterns = [
    // Explicit selection
    /選びます/,
    /選びたい/,
    /選んでください/,
    /選んで/,
    /これにする/,
    /こちらにする/,
    /それにする/,
    /これにします/,
    /こちらにします/,
    /それにします/,
    /これでお願いします/,
    /こちらでお願いします/,
    /それでお願いします/,
    /これがいい/,
    /こちらがいい/,
    /それがいい/,
    /これが気に入/,
    /こちらが気に入/,
    /それが気に入/,

    // Ordinal selection
    /番目.*(いい|良い|お願い|選|決|する)/,
    /つ目.*(いい|良い|お願い|選|決|する)/,
    /件目.*(いい|良い|お願い|選|決|する)/,
    /軒目.*(いい|良い|お願い|選|決|する)/,

    // Natural agreement
    /に決めました/,
    /に決定します/,
    /に決める/,
    /にします/,
    /がよさそう/,
    /が良さそう/,
    /がよさげ/,
    /が好み/,
    /が好き/,
    /が気になる/,
    /が希望です/,
    /が希望/,
  ];

  
  return patterns.some((pattern) => pattern.test(message));
}
  // =========================================================================
  // 1. extractEntities — "What data did the user give me?"
  // =========================================================================

  extractEntities(message: string): SemanticEntity[] {
    return [
       ...this.extractDateRange(message),
      ...this.extractCustomerCount(message),
      ...this.extractContactName(message),
      ...this.extractSpecialRequest(message),
      ...this.extractOrdinal(message),
      ...this.extractSelectionCriteria(message),
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
    const isSelection = this.isListingSelection(message);

    // ── GET MY BOOKINGS ────────────────────────────────────────────────────
    if (lower.includes("show my bookings") || lower.includes("my bookings")) {
      return { type: AgentAction.GET_MY_BOOKINGS, confidence: 0.99 };
    }
   // ── LISTING SELECTION ─────────────────────────────────────────

// User selects a listing from previous search results.
// This enters the existing booking flow, but does not create
// a booking until check-in and check-out dates are provided.
if (hasOrdinals && isSelection) {
  return {
    type: AgentAction.CREATE_BOOKING,
    confidence: 0.95,
  };
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
      const monthMap: Record<string, string> = {
        january: "01", february: "02", march: "03", april: "04",
        may: "05", june: "06", july: "07", august: "08",
        september: "09", october: "10", november: "11", december: "12",
      };
      const inMonth = monthMap[monthMatch[1].toLowerCase()] ?? monthMatch[1];
      const outMonth = monthMap[monthMatch[3].toLowerCase()] ?? monthMatch[3];
      const inDay = monthMatch[2].padStart(2, "0");
      const outDay = monthMatch[4].padStart(2, "0");
      return [
        { type: EntityType.CHECK_IN_DATE, value: `${inMonth}-${inDay}`, confidence: 0.95 },
        { type: EntityType.CHECK_OUT_DATE, value: `${outMonth}-${outDay}`, confidence: 0.95 },
      ];
    }

    return [];
  }


  
  /** "2 customers", "3 people" → CUSTOMER_COUNT */
  private extractCustomerCount(message: string): SemanticEntity[] {
    const match = message.match(/(\d+)\s*(customers?|people|person|人)/i);
    if (!match) return [];

    return [{ type: EntityType.CUSTOMER_COUNT, value: parseInt(match[1], 10), confidence: 0.95 }];
  }

  private extractSelectionCriteria(message: string): SemanticEntity[] {
  type SelectionCriteria =
    | "CHEAPEST"
    | "MOST_EXPENSIVE"
    | "PRICE_ASC"
    | "PRICE_DESC"
    | "BEST_VALUE";

  const rules: {
    patterns: RegExp[];
    value: SelectionCriteria;
  }[] = [
    {
      value: "CHEAPEST",
      patterns: [
        /一番安い/,
        /いちばん安い/,
        /最も安い/,
        /最安/,
        /一番安く/,
        /できるだけ安く/,
        /なるべく安く/,
        /安いもの/,
        /安いホテル/,
        /安い宿/,
        /料金が安い/,
        /価格が安い/,
        /安価な/,
        /お手頃/,
        /リーズナブル/,
        /格安/,
        /安い順/,
      ],
    },
    {
      value: "MOST_EXPENSIVE",
      patterns: [
        /一番高い/,
        /いちばん高い/,
        /最も高い/,
        /最高値/,
        /高いもの/,
        /高い順/,
      ],
    },
    {
      value: "PRICE_ASC",
      patterns: [
        /価格.*安い順/,
        /料金.*安い順/,
        /価格.*昇順/,
        /料金.*昇順/,
      ],
    },
    {
      value: "PRICE_DESC",
      patterns: [
        /価格.*高い順/,
        /料金.*高い順/,
        /価格.*降順/,
        /料金.*降順/,
      ],
    },
    {
      value: "BEST_VALUE",
      patterns: [
        /コスパ.*いい/,
        /コストパフォーマンス.*いい/,
        /お得/,
        /割安/,
        /費用対効果.*高い/,
      ],
    },
  ];

  for (const rule of rules) {
    if (rule.patterns.some((pattern) => pattern.test(message))) {
      return [{
        type: EntityType.SELECTION_CRITERIA,
        value: rule.value,
        confidence: 0.95,
      }];
    }
  }

  return [];
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

  // Avoid confusing price ranking with ordinal selection.
  type SelectionCriteria =
  | "CHEAPEST"
  | "MOST_EXPENSIVE"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "BEST_VALUE";

const PRICE_SELECTION_RULES: {
  patterns: RegExp[];
  value: SelectionCriteria;
}[] = [
  {
    value: "CHEAPEST",
    patterns: [
      /一番安い/,
      /いちばん安い/,
      /最も安い/,
      /最安/,
      /一番安く/,
      /できるだけ安く/,
      /なるべく安く/,
      /安いもの/,
      /安いホテル/,
      /料金が安い/,
      /価格が安い/,
      /安価な/,
      /お手頃な/,
      /リーズナブルな/,
      /格安の/,
      /安い順/,
    ],
  },
  {
    value: "MOST_EXPENSIVE",
    patterns: [
      /一番高い/,
      /いちばん高い/,
      /最も高い/,
      /最高値/,
      /高いもの/,
      /高級な/,
      /高い順/,
    ],
  },
  {
    value: "PRICE_ASC",
    patterns: [
      /価格.*安い順/,
      /料金.*安い順/,
      /価格.*昇順/,
      /料金.*昇順/,
    ],
  },
  {
    value: "PRICE_DESC",
    patterns: [
      /価格.*高い順/,
      /料金.*高い順/,
      /価格.*降順/,
      /料金.*降順/,
    ],
  },
  {
    value: "BEST_VALUE",
    patterns: [
      /コスパ.*いい/,
      /コストパフォーマンス.*いい/,
      /お得な/,
      /割安な/,
      /費用対効果.*高い/,
    ],
  },
];
  // 一番安い means cheapest, NOT the first listing.
  const priceRankingPatterns = [
    /一番安い/,
    /いちばん安い/,
    /最も安い/,
    /一番高い/,
    /いちばん高い/,
    /最も高い/,
    /最安/,
    /最高値/,
  ];

  if (priceRankingPatterns.some((pattern) => pattern.test(message))) {
    return [];
  }

  // Longer expressions first to avoid partial matching.
  const keywords = Object.keys(ORDINAL_MAP).sort(
    (a, b) => b.length - a.length,
  );

  for (const keyword of keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      return [{
        type: EntityType.ORDINAL,
        value: ORDINAL_MAP[keyword],
        confidence: 0.95,
      }];
    }
  }

  return [];
}
}
