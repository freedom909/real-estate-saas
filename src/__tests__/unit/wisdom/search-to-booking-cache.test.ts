// src/__tests__/unit/wisdom/search-to-booking-cache.test.ts
//
// Regression test for: "检索成功以后，缓存没有保存住房信息，导致下单失败"
//   Turn 1: search succeeds → LISTING_SEARCH_RESULT artifact
//   Turn 2: user says "ご注文もらえませんか？" → must classify as CREATE_BOOKING (not GENERAL)
//           and resolve the listing from the cached search results.
//
// Covers:
//   1. IntentExtractor: 注文/ご注文 → CREATE_BOOKING (BOOKING domain)
//   2. NormalizeIntentStage: 注文 regex + forces AIDomain.BOOKING
//   3. ArtifactMemoryStage: caches listings even if bookingStateUpdater throws
//   4. BookingAgent.handleCreateBooking: resolves listingId from cache (ordinal default = first)

import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { IntentExtractor } from "@/wisdom/semantic/extractors/intent.extractor";
import { NormalizeIntentStage } from "@/wisdom/orchestration/stage/normalizeIntent.stage";
import { ArtifactMemoryStage } from "@/wisdom/orchestration/stage/artifactMemory.stage";
import { BookingStateUpdater } from "@/wisdom/memory/booking-state-updater";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { BookingAgent } from "@/wisdom/agents/booking/booking.agent";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { getCachedSearchResults, cacheSearchResults } from "@/wisdom/memory/search-results-cache";

const LISTINGS = [
  { id: "listing-001", title: "Beautiful Flower Room", price: 12000, numOfCustomers: 2 },
  { id: "listing-002", title: "Garden View Room", price: 15000, numOfCustomers: 3 },
];

function makeSearchArtifact() {
  return {
    type: "LISTING_SEARCH_RESULT",
    content: { listings: LISTINGS, total: LISTINGS.length },
  };
}

function makeCtx(sessionId: string, rawInput: string, artifacts: any[]) {
  return {
    request: {
      message: rawInput,
      context: {
        identity: { user: { id: "user-1" } },
        runtime: { source: "web", sessionId },
        resources: {} as Record<string, any>,
      },
    },
    memoryContext: { userId: "user-1", sessionId, session: {} as any },
    rawResult: { success: true, artifacts },
    startTime: Date.now(),
  } as any;
}

describe("Search → cache → booking (ご注文) regression", () => {
  let sessionStore: MemorySessionStore;

  beforeEach(() => {
    sessionStore = new MemorySessionStore();
  });

  // ── 1. Intent: 注文 → CREATE_BOOKING ────────────────────────────
  it("classifies 'ご注文もらえませんか？' as CREATE_BOOKING / BOOKING", () => {
    const result = new IntentExtractor().extract("ご注文もらえませんか？");
    expect(result.action).toBe(AgentAction.CREATE_BOOKING);
    expect(result.domain).toBe(AIDomain.BOOKING);
  });

  it("still classifies予約-phrases as CREATE_BOOKING", () => {
    const result = new IntentExtractor().extract("この部屋を予約したいです");
    expect(result.action).toBe(AgentAction.CREATE_BOOKING);
    expect(result.domain).toBe(AIDomain.BOOKING);
  });

  it("does NOT classify cancellation as CREATE_BOOKING", () => {
    const result = new IntentExtractor().extract("予約をキャンセルしてください");
    expect(result.action).toBe(AgentAction.CANCEL_BOOKING);
  });

  // ── 2. NormalizeIntentStage: regex + domain override ────────────
  it("normalizeIntent upgrades 注文-phrases to CREATE_BOOKING with BOOKING domain", async () => {
    const stage = new NormalizeIntentStage();
    const generalSemantic = new SemanticContext(
      "ご注文もらえませんか？",
      [],
      { type: AgentAction.GENERAL, confidence: 0.5 },
      0.5,
      AIDomain.GENERAL,
      true,
    );
    const ctx = makeCtx("s-normalize", "ご注文もらえませんか？", []);
    ctx.resolvedSemantic = generalSemantic;

    await stage.execute(ctx);

    expect(ctx.resolvedSemantic.action.type).toBe(AgentAction.CREATE_BOOKING);
    expect(ctx.resolvedSemantic.domain).toBe(AIDomain.BOOKING);
  });

  // ── 3. ArtifactMemoryStage caches listings ──────────────────────
  it("search turn persists listings to the global cache", async () => {
    const updater = new BookingStateUpdater(sessionStore as any);
    const stage = new ArtifactMemoryStage(updater as any);
    const ctx = makeCtx("s-cache", "東京の部屋を検索", [makeSearchArtifact()]);

    await stage.execute(ctx);

    expect(getCachedSearchResults("s-cache")).toHaveLength(2);
    expect(ctx.request.context.resources.searchResults).toHaveLength(2);

    // session memory also holds them (factory injects them next turn)
    const session = sessionStore.get("s-cache");
    expect(session?.searchResults).toHaveLength(2);
  });

  it("still caches listings even when bookingStateUpdater throws", async () => {
    const brokenUpdater = { apply: jest.fn().mockImplementation(() => { throw new Error("boom"); }) };
    const stage = new ArtifactMemoryStage(brokenUpdater as any);
    const ctx = makeCtx("s-resilient", "東京の部屋を検索", [makeSearchArtifact()]);

    await expect(stage.execute(ctx)).resolves.toBeTruthy();
    expect(getCachedSearchResults("s-resilient")).toHaveLength(2);
  });

  // ── 4. BookingAgent resolves listing from cache ─────────────────
  it("booking turn resolves the first cached listing and asks for dates", async () => {
    cacheSearchResults("s-book", LISTINGS);

    const createBookingUseCase = { execute: jest.fn() };
    const unused = { execute: jest.fn() };
    const agent = new BookingAgent(
      unused as any, // cancel
      createBookingUseCase as any, // create
      unused as any, // get
      unused as any, // confirm
      unused as any, // complete
      unused as any, // getForCustomer
      sessionStore as any,
    );

    const semantic = new SemanticContext(
      "ご注文もらえませんか？",
      [],
      { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
      0.9,
      AIDomain.BOOKING,
      true,
    );
    const context = {
      identity: { user: { id: "user-1" } },
      runtime: { source: "web", sessionId: "s-book" },
      resources: { searchResults: [] }, // empty → must fall back to global cache
      trace: { correlationId: "t" },
    } as any;

    const res = await agent.execute(semantic, context);

    // No listing picked from cache → tells user to search (cache empty)
    // With cache → selects first listing and asks for check-in/check-out dates
    expect(res.summary).toContain("チェックイン");
    expect(res.artifacts?.[0]?.type).toBe("LISTING_SELECTED");
    expect((res.artifacts?.[0]?.content as any)?.listingId).toBe("listing-001");
    expect(createBookingUseCase.execute).not.toHaveBeenCalled();
  });

  it("booking turn with empty cache asks the user which listing", async () => {
    const createBookingUseCase = { execute: jest.fn() };
    const unused = { execute: jest.fn() };
    const agent = new BookingAgent(
      unused as any,
      createBookingUseCase as any,
      unused as any,
      unused as any,
      unused as any,
      unused as any,
      sessionStore as any,
    );

    const semantic = new SemanticContext(
      "ご注文もらえませんか？",
      [],
      { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
      0.9,
      AIDomain.BOOKING,
      true,
    );
    const context = {
      identity: { user: { id: "user-1" } },
      runtime: { source: "web", sessionId: "s-empty" },
      resources: { searchResults: [] },
      trace: { correlationId: "t" },
    } as any;

    const res = await agent.execute(semantic, context);
    expect(res.summary).toContain("予約したい物件はどれですか");
  });
});
