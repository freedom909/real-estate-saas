
// src/wisdom/semantic/extractors/rule.extractor.ts

import { injectable } from "tsyringe";
import { SemanticContext } from "../semantic-context";
import { EntityType } from "../../shared/enums/entity-type.enum";
import { AIDomain } from "../../shared/enums/domain.enum";
import { WisdomRequest } from "../../contracts/request";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";

const UUID_REGEX =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const BOOKING_CANCEL_PATTERNS = [
  /\bcancel\s+(?:my\s+)?(?:booking|reservation)\b/i,
  /\bplease\s+cancel\b/i,
  /予約をキャンセル/,
  /予約のキャンセル/,
  /予約を取り消/,
];

const BOOKING_CREATE_PATTERNS = [
  /予約してください/,
  /予約をお願いします/,
  /予約をお願い/,
  /予約したい/,
  /予約を取りたい/,
  /予約を入れたい/,
  /\bbook\s+(?:this|a|the)\s+(?:listing|property|room)\b/i,
  /\bmake\s+a\s+reservation\b/i,
  /\bI'd like to book\b/i,
  /\bI want to book\b/i,
  /注文してください/,
  /注文をお願いします/,
];

const LISTING_TITLE_PATTERNS = [
  /\boptimize\s+(?:the\s+)?title\b/i,
  /\bimprove\s+(?:the\s+)?title\b/i,
  /\brewrite\s+(?:the\s+)?title\b/i,
  /タイトルを最適化/,
  /タイトルを改善/,
  /タイトルを書き直/,
];

const LISTING_DESCRIPTION_PATTERNS = [
  /\boptimize\s+(?:the\s+)?description\b/i,
  /\bimprove\s+(?:the\s+)?description\b/i,
  /\brewrite\s+(?:the\s+)?description\b/i,
  /説明文を最適化/,
  /説明文を改善/,
  /説明文を書き直/,
];

@injectable()
export class RuleExtractor {
  async extract(request: WisdomRequest): Promise<SemanticContext> {
    const message = request?.message ?? "";
    const lower = message.toLowerCase();

    // 1. BOOKING CANCEL
    if (BOOKING_CANCEL_PATTERNS.some(pattern => pattern.test(message))) {
      const bookingId =
        message.match(UUID_REGEX)?.[0] ??
        request.context.resources?.bookingId;

      const entities = bookingId
        ? [{
            type: EntityType.BOOKING_ID,
            value: bookingId,
            confidence: 0.95,
          }]
        : [];

      return new SemanticContext(
        message,
        entities,
        { type: AgentAction.CANCEL_BOOKING, confidence: 0.99 },
        0.99,
        AIDomain.BOOKING,
        true
      );
    }

    // 2. BOOKING CREATE
    if (BOOKING_CREATE_PATTERNS.some(pattern => pattern.test(message))) {
      return new SemanticContext(
        message,
        [],
        { type: AgentAction.CREATE_BOOKING, confidence: 0.95 },
        0.95,
        AIDomain.BOOKING,
        true
      );
    }

    // 3. LISTING ID
    const entities: {
      type: EntityType;
      value: string;
      confidence: number;
    }[] = [];

    const listingMatch = message.match(
      /listingid\s*=\s*([a-zA-Z0-9-]+)/i
    );

    const listingId =
      listingMatch?.[1] ??
      request.context.resources?.listingId;

    if (listingId) {
      entities.push({
        type: EntityType.LISTING_ID,
        value: listingId,
        confidence: 0.95,
      });
    }

    // 4. LISTING TITLE
    if (LISTING_TITLE_PATTERNS.some(pattern => pattern.test(message))) {
      return new SemanticContext(
        message,
        entities,
        { type: AgentAction.OPTIMIZE_TITLE, confidence: 0.99 },
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    // 5. LISTING DESCRIPTION
    if (
      LISTING_DESCRIPTION_PATTERNS.some(pattern => pattern.test(message))
    ) {
      return new SemanticContext(
        message,
        entities,
        { type: AgentAction.OPTIMIZE_DESCRIPTION, confidence: 0.99 },
        0.99,
        AIDomain.LISTING,
        true
      );
    }

    return new SemanticContext(
      message,
      [],
      null,
      0,
      AIDomain.UNKNOWN,
      false
    );
  }
}
