// src/wisdom/semantic/extractors/intent.extractor.ts
//
// Determines the user's intent (action) from the message.
// Extracts: AgentAction with confidence
// Does NOT extract entities — those are handled by dedicated extractors.
// Supports English and Japanese keywords.

import { injectable } from "tsyringe";
import { AgentAction } from "../../shared/enums/action.enum";
import { AIDomain } from "../../shared/enums/domain.enum";

export interface IntentResult {
  action: AgentAction;
  confidence: number;
  domain: AIDomain;
}

// Action rules for booking operations (keyword → action mapping)
const BOOKING_ACTION_RULES: {
  keywords: string[];
  action: AgentAction;
}[] = [
  // 1. 确定预约：必须是明确的确认/批准意图
  {
    keywords: [
      "confirm booking",
      "confirm reservation",
      "予約を確定",
      "予約を承認",
    ],
    action: AgentAction.CONFIRM_BOOKING,
  },

  // 2. 查询预约：不是确认预约
  {
    keywords: [
      "get booking",
      "get reservation",
      "show booking",
      "show reservation",
      "予約を確認",
      "予約確認",
      "予約情報",
      "予約状況",
      "予約を見る",
    ],
    action: AgentAction.GET_BOOKING,
  },

  // 3. 取消预约
  {
    keywords: [
      "cancel booking",
      "cancel reservation",
      "予約をキャンセル",
      "予約キャンセル",
      "予約を取り消し",
    ],
    action: AgentAction.CANCEL_BOOKING,
  },

  // 4. 完成预约/入住相关操作
  {
    keywords: [
      "complete booking",
      "complete reservation",
      "チェックイン",
    ],
    action: AgentAction.COMPLETE_BOOKING,
  },
];

@injectable()
export class IntentExtractor {
  extract(message: string, context?: { bookingId?: string; listingId?: string }): IntentResult {
    const lower = message.toLowerCase();

    // ── LISTING INTENTS (highest priority, very specific) ──────────────────
    if (lower.includes("optimize") || lower.includes("improve") || lower.includes("最適化") || lower.includes("改善")) {
      if (lower.includes("title") || lower.includes("タイトル") || lower.includes("題名")) {
        return { action: AgentAction.OPTIMIZE_TITLE, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("description") || lower.includes("説明") || lower.includes("詳細")) {
        return { action: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("price") || lower.includes("料金") || lower.includes("価格")) {
        return { action: AgentAction.OPTIMIZE_PRICE, confidence: 0.99, domain: AIDomain.LISTING };
      }
      if (lower.includes("category") || lower.includes("カテゴリ")) {
        return { action: AgentAction.OPTIMIZE_CATEGORY, confidence: 0.99, domain: AIDomain.LISTING };
      }
      return { action: AgentAction.OPTIMIZE_LISTING, confidence: 0.90, domain: AIDomain.LISTING };
    }

    if (lower.includes("seo") || lower.includes("search engine")) {
      return { action: AgentAction.SEO_ANALYSIS, confidence: 0.95, domain: AIDomain.LISTING };
    }

    if (lower.includes("title") || lower.includes("タイトル") || lower.includes("題名")) {
      return { action: AgentAction.OPTIMIZE_TITLE, confidence: 0.95, domain: AIDomain.LISTING };
    }

    if (lower.includes("description") || lower.includes("説明") || lower.includes("詳細")) {
      return { action: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.95, domain: AIDomain.LISTING };
    }

    // ── BOOKING INTENTS ─────────────────────────────────────────────────────

    // GET MY BOOKINGS (very specific)
    if (lower.includes("show my bookings") || lower.includes("my bookings") || lower.includes("自分の予約") || lower.includes("予約一覧")) {
      return { action: AgentAction.GET_MY_BOOKINGS, confidence: 0.99, domain: AIDomain.BOOKING };
    }

    // Booking actions matched by keyword
    for (const rule of BOOKING_ACTION_RULES) {
      if (rule.keywords.some(kw => lower.includes(kw))) {
        return { action: rule.action, confidence: 0.95, domain: AIDomain.BOOKING };
      }
    }

    // CANCEL without "booking" keyword
const cancelPatterns = [
  /\bcancel\s+(?:my\s+)?(?:booking|reservation)\b/i,
  /\bplease\s+cancel\b/i,
  /予約をキャンセル/,
  /予約のキャンセル/,
  /予約を取り消/,
];

if (cancelPatterns.some((pattern) => pattern.test(message))) {
  return {
    action: AgentAction.CANCEL_BOOKING,
    confidence: 0.95,
    domain: AIDomain.BOOKING,
  };
}

    // CREATE BOOKING
// CREATE BOOKING

// CREATE BOOKING
const createBookingPatterns = [
  // Explicit Japanese booking requests
  /予約してください/,
  /予約をお願いします/,
  /予約をお願い/,
  /予約したい/,
  /予約を取りたい/,
  /予約を入れたい/,
  /予約を申し込みたい/,
  /宿泊を予約/,

  // Natural Japanese requests
  /ご注文(?:を)?(?:もらえませんか|いただけませんか|お願いできますか)/,
  /予約(?:を)?(?:して)?(?:もらえませんか|いただけませんか)/,
  /予約をお願いできますか/,
  /予約できますか/,

  // English
  /\bbook\s+(?:this|a|the)\s+(?:listing|property|room)\b/i,
  /\bbook\s+(?:it|this)\b/i,
  /\bmake\s+a\s+reservation\b/i,
  /\bI'd like to book\b/i,
  /\bI want to book\b/i,
  /\bplease book\b/i,
];

if (createBookingPatterns.some((pattern) => pattern.test(message))) {
  return {
    action: AgentAction.CREATE_BOOKING,
    confidence: 0.95,
    domain: AIDomain.BOOKING,
  };
}


if (createBookingPatterns.some(pattern => pattern.test(message))) {
  return {
    action: AgentAction.CREATE_BOOKING,
    confidence: 0.95,
    domain: AIDomain.BOOKING,
  };
}

    // ── LISTING SEARCH (broader, lower priority) ────────────────────────────
    if (lower.includes("search") || lower.includes("find") || lower.includes("show") ||
        lower.includes("look") || lower.includes("list") ||
        lower.includes("探") || lower.includes("検索") || lower.includes("探し") ||
        lower.includes("表示") || lower.includes("一覧") || lower.includes("見つけて") ||
        lower.includes("ご紹介") || lower.includes("お勧め") || lower.includes("おすすめ") ||
        lower.includes("教えて") || lower.includes("見せて") || lower.includes("泊まりたい") ||
        lower.includes("泊まり") || lower.includes("滞在")) {
      return { action: AgentAction.SEARCH_LISTING, confidence: 0.80, domain: AIDomain.LISTING };
    }

    // ── GENERAL (fallback) ──────────────────────────────────────────────────

    return { action: AgentAction.GENERAL, confidence: 0.50, domain: AIDomain.GENERAL };
  }
}
