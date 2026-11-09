// src/__tests__/unit/wisdom/cheapest-booking-selection.test.ts
//
// Regression test for: "在搜索出房屋列表以后，说「一番安いもんを注文してください」，
// agent 没有识别出「一番安い」，忽略了价格比较，错误地确认房源"
//
// Covers:
//   1. MessageRuleExtractor: 一番安い → SELECTION_CRITERIA "CHEAPEST" (and NOT ORDINAL)
//   2. MessageRuleExtractor: 最後の → ORDINAL "last"
//   3. SemanticExtractor: MessageRuleExtractor entities are merged into the semantic context
//   4. ListingReferenceResolver: resolveByPrice matches Japanese price-ranking phrases
//      (the old \b(...|安い|最安)\b regex never matched pure-Japanese input)
//   5. BookingAgent: SELECTION_CRITERIA + pricePerNight-shaped cache rows → cheapest
//      (cache rows use `pricePerNight`, not `price`)
//   6. BookingAgent: ORDINAL "last" → the last cached listing (parseOrdinal fix)

import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { MessageRuleExtractor } from "@/wisdom/semantic/extractors/message-rule.extractor";
import { SemanticExtractor } from "@/wisdom/semantic/semantic-extractor";
import { IntentExtractor } from "@/wisdom/semantic/extractors/intent.extractor";
import { DateExtractor } from "@/wisdom/semantic/extractors/date.extractor";
import { LocationExtractor } from "@/wisdom/semantic/extractors/location.extractor";
import { BookingIdExtractor } from "@/wisdom/semantic/extractors/booking-id.extractor";
import { ListingExtractor } from "@/wisdom/semantic/extractors/listing.extractor";
import { CustomerExtractor } from "@/wisdom/semantic/extractors/customer.extractor";
import { BookingAgent } from "@/wisdom/agents/booking/booking.agent";
import { ListingReferenceResolver } from "@/wisdom/reference/IlistingReference-resolver";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { cacheSearchResults } from "@/wisdom/memory/search-results-cache";

// Cache rows in the real pipeline come from toChatListingRow() and carry
// `pricePerNight` (NOT `price`). Keep the realistic shape here on purpose.
const ROWS = [
  { id: "listing-expensive", title: "Deluxe Suite", pricePerNight: 50000, numOfCustomers: 2 },
  { id: "listing-cheap", title: "Budget Room", pricePerNight: 8000, numOfCustomers: 2 },
  { id: "listing-mid", title: "Standard Room", pricePerNight: 20000, numOfCustomers: 2 },
];

function makeAgent() {
  const createBookingUseCase = { execute: jest.fn() };
  const unused = { execute: jest.fn() };
  const agent = new BookingAgent(
    unused as any, // cancel
    createBookingUseCase as any, // create
    unused as any, // get
    unused as any, // confirm
    unused as any, // complete
    unused as any, // getForCustomer
    new MemorySessionStore() as any,
  );
  return { agent, createBookingUseCase };
}

function makeContext(sessionId: string) {
  return {
    identity: { user: { id: "user-1" } },
    runtime: { source: "web", sessionId },
    resources: { searchResults: [] }, // empty → agent must fall back to global cache
    trace: { correlationId: "t" },
  } as any;
}

function makeBookingSemantic(message: string, entities: any[]) {
  return new SemanticContext(
    message,
    entities,
    { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
    0.9,
    AIDomain.BOOKING,
    true,
  );
}

describe("一番安い → cheapest-listing selection regression", () => {
  // ── 1. Entity extraction: price ranking is SELECTION_CRITERIA ──
  it("MessageRuleExtractor: 一番安い → SELECTION_CRITERIA 'CHEAPEST', no ORDINAL", () => {
    const entities = new MessageRuleExtractor().extractEntities(
      "一番安いもんを注文してください。",
    );

    const criteria = entities.find(
      (e) => e.type === EntityType.SELECTION_CRITERIA,
    );
    expect(criteria?.value).toBe("CHEAPEST");

    // 一番安い must NOT be misread as an ordinal ("一番" ≠ first)
    expect(entities.some((e) => e.type === EntityType.ORDINAL)).toBe(false);
  });

  it("MessageRuleExtractor: 最後のを予約 → ORDINAL 'last'", () => {
    const entities = new MessageRuleExtractor().extractEntities(
      "最後のを予約してください。",
    );

    const ordinal = entities.find((e) => e.type === EntityType.ORDINAL);
    expect(ordinal?.value).toBe("last");
  });

  // ── 2. SemanticExtractor wires MessageRuleExtractor in ──
  it("SemanticExtractor merges MessageRuleExtractor entities (SELECTION_CRITERIA reaches semantic)", async () => {
    const extractor = new SemanticExtractor(
      new IntentExtractor(),
      new DateExtractor(),
      new LocationExtractor(),
      new BookingIdExtractor(),
      new ListingExtractor(),
      new CustomerExtractor(),
      { extract: jest.fn() } as any, // LLM stub — rule-based intent is confident enough
      new MessageRuleExtractor(),
    );

    const ctx = await extractor.extract({
      message: "一番安いもんを注文してください。",
      context: { resources: {} },
    } as any);

    const criteria = ctx.entities.find(
      (e) => e.type === EntityType.SELECTION_CRITERIA,
    );
    expect(criteria?.value).toBe("CHEAPEST");
    expect(ctx.entities.some((e) => e.type === EntityType.ORDINAL)).toBe(false);
  });

  // ── 3. Reference resolver: resolveByPrice matches Japanese phrases ──
  it("ListingReferenceResolver: 一番安い resolves the cheapest listing (not the first)", async () => {
    const resolver = new ListingReferenceResolver({} as any, {} as any);

    const semantic = makeBookingSemantic("一番安いもんを注文してください。", []);
    const context = { resources: { searchResults: ROWS } } as any;

    const result = await resolver.resolve(semantic, context);

    const listingRef = result.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingRef?.value).toBe("listing-cheap");
  });

  // ── 4. BookingAgent price-based selection (pricePerNight-shaped rows) ──
  it("BookingAgent: SELECTION_CRITERIA 'CHEAPEST' picks the cheapest cached listing", async () => {
    cacheSearchResults("s-cheap", ROWS);
    const { agent, createBookingUseCase } = makeAgent();

    const res = await agent.execute(
      makeBookingSemantic("一番安いもんを注文してください。", [
        { type: EntityType.SELECTION_CRITERIA, value: "CHEAPEST", confidence: 0.95 },
      ]),
      makeContext("s-cheap"),
    );

    expect((res.artifacts?.[0]?.content as any)?.listingId).toBe("listing-cheap");
    expect(res.summary).toContain("チェックイン");
    expect(createBookingUseCase.execute).not.toHaveBeenCalled();
  });

  it("BookingAgent: SELECTION_CRITERIA 'MOST_EXPENSIVE' picks the priciest cached listing", async () => {
    cacheSearchResults("s-expensive", ROWS);
    const { agent } = makeAgent();

    const res = await agent.execute(
      makeBookingSemantic("一番高いのを予約してください。", [
        { type: EntityType.SELECTION_CRITERIA, value: "MOST_EXPENSIVE", confidence: 0.95 },
      ]),
      makeContext("s-expensive"),
    );

    expect((res.artifacts?.[0]?.content as any)?.listingId).toBe(
      "listing-expensive",
    );
    expect(res.summary).toContain("チェックイン");
  });

  // ── 5. BookingAgent ordinal selection (parseOrdinal "last" fix) ──
  it("BookingAgent: ORDINAL 'last' picks the last cached listing", async () => {
    cacheSearchResults("s-last", ROWS);
    const { agent } = makeAgent();

    const res = await agent.execute(
      makeBookingSemantic("最後のを予約してください。", [
        { type: EntityType.ORDINAL, value: "last", confidence: 0.95 },
      ]),
      makeContext("s-last"),
    );

    expect((res.artifacts?.[0]?.content as any)?.listingId).toBe("listing-mid");
    expect(res.summary).toContain("チェックイン");
  });

  // ── 6. End-to-end: message → entities → agent ──
  it("end-to-end: 「一番安いもんを注文してください」 books the cheapest listing", async () => {
    const entities = new MessageRuleExtractor().extractEntities(
      "一番安いもんを注文してください。",
    );
    cacheSearchResults("s-e2e", ROWS);
    const { agent, createBookingUseCase } = makeAgent();

    const res = await agent.execute(
      makeBookingSemantic("一番安いもんを注文してください。", entities),
      makeContext("s-e2e"),
    );

    expect((res.artifacts?.[0]?.content as any)?.listingId).toBe("listing-cheap");
    expect(res.summary).toContain("チェックイン");
    expect(createBookingUseCase.execute).not.toHaveBeenCalled();
  });
});
