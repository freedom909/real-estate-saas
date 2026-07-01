// src/wisdom/semantic/semantic-extractor.ts
//
// Orchestrator: runs all extractors in parallel and assembles the final SemanticContext.
//
// Pipeline:
//   1. IntentExtractor → determines the action (CANCEL_BOOKING, CREATE_BOOKING, etc.)
//   2. Entity extractors → DateExtractor, LocationExtractor, BookingIdExtractor, etc.
//   3. LLM fallback → if intent is GENERAL or low confidence

import { inject, injectable } from "tsyringe";
import { ISemanticExtractor } from "../contracts/semantic-extractor";
import { SemanticContext } from "./semantic-context";
import { AgentAction } from "../shared/enums/action.enum";
import { IntentExtractor } from "./extractors/intent.extractor";
import { DateExtractor } from "./extractors/date.extractor";
import { LocationExtractor } from "./extractors/location.extractor";
import { BookingIdExtractor } from "./extractors/booking-id.extractor";
import { ListingExtractor } from "./extractors/listing.extractor";
import { GuestExtractor } from "./extractors/guest.extractor";
import { LLMExtractor } from "./extractors/llm.extractor";
import { WisdomRequest } from "../contracts/request";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";

@injectable()
export class SemanticExtractor implements ISemanticExtractor {
  constructor(
    @inject(WISDOM_TOKENS.extractors.intentExtractor)
    private intentExtractor: IntentExtractor,

    @inject(WISDOM_TOKENS.extractors.dateExtractor)
    private dateExtractor: DateExtractor,

    @inject(WISDOM_TOKENS.extractors.locationExtractor)
    private locationExtractor: LocationExtractor,

    @inject(WISDOM_TOKENS.extractors.bookingIdExtractor)
    private bookingIdExtractor: BookingIdExtractor,

    @inject(WISDOM_TOKENS.extractors.listingExtractor)
    private listingExtractor: ListingExtractor,

    @inject(WISDOM_TOKENS.extractors.guestExtractor)
    private guestExtractor: GuestExtractor,

    @inject(WISDOM_TOKENS.extractors.llmExtractor)
    private llmExtractor: LLMExtractor,
  ) {}

  async extract(request: WisdomRequest): Promise<SemanticContext> {
    const message = request.message;
    const context = {
      bookingId: request.context.resources?.bookingId,
      listingId: request.context.resources?.listingId,
    };

    // ── 1. Intent extraction ────────────────────────────────────────────────
    const intent = this.intentExtractor.extract(message, context);

    // ── 2. Entity extraction (all extractors run in parallel) ────────────────
    // Set context values for extractors that need them
    this.bookingIdExtractor.setContextBookingId(context.bookingId);
    this.listingExtractor.setContextListingId(context.listingId);

    const entities = [
      ...this.dateExtractor.extract(message),
      ...this.locationExtractor.extract(message),
      ...this.bookingIdExtractor.extract(message),
      ...this.listingExtractor.extract(message),
      ...this.guestExtractor.extract(message),
    ];

    // ── 3. Assemble SemanticContext ──────────────────────────────────────────
    const ctx = new SemanticContext(
      message,
      entities,
      { type: intent.action, confidence: intent.confidence },
      intent.confidence,
      intent.domain,
      true,
    );

    // ── 4. LLM fallback for complex/uncertain intents ───────────────────────
    // If the rule-based intent is GENERAL with low confidence, try LLM
    if (intent.action === AgentAction.GENERAL && intent.confidence < 0.6) {
      return await this.llmExtractor.extract(message, request);
    }

    return ctx;
  }
}
