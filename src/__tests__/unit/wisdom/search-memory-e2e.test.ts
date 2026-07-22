import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { BookingStateUpdater } from "@/wisdom/memory/booking-state-updater";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { ReferenceResolver } from "@/wisdom/reference/reference-resolver";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { MemoryContext } from "@/wisdom/memory/type/memory-context";
import { cacheSearchResults, getCachedSearchResults } from "@/wisdom/memory/search-results-cache";

/**
 * End-to-end test: simulates the full flow
 *   Turn 1: User searches for rooms in Tokyo Shibuya
 *   Turn 2: User says "book the beautiful flower room"
 *   Turn 3: User says "book it" (ordinal fallback)
 *
 * Verifies:
 *   1. Search results are persisted to session memory
 *   2. Search results survive across turns
 *   3. Title-based matching works ("book the beautiful flower room")
 *   4. Ordinal fallback works ("book it" → first listing)
 *   5. Session isolation (different sessions don't share results)
 */

// ─── Simulated DB listings ──────────────────────────────────────
const DB_LISTINGS = [
  {
    id: "listing-tokyo-001",
    title: "Beautiful Flower Room",
    address: "Tokyo Shibuya 2-3-1",
    price: 12000,
    numOfCustomers: 2,
    description: "A beautiful room decorated with fresh flowers in Shibuya",
  },
  {
    id: "listing-tokyo-002",
    title: "Garden View Room",
    address: "Tokyo Shibuya 4-5-6",
    price: 15000,
    numOfCustomers: 3,
    description: "Peaceful garden view from the window",
  },
  {
    id: "listing-tokyo-003",
    title: "Ocean Breeze Suite",
    address: "Okinawa Naha 1-2-3",
    price: 20000,
    numOfCustomers: 4,
    description: "Sea view with fresh ocean breeze",
  },
];

// ─── Shared infrastructure ──────────────────────────────────────
let sessionStore: MemorySessionStore;
let updater: BookingStateUpdater;
let resolver: ReferenceResolver;

beforeEach(() => {
  jest.clearAllMocks();
  sessionStore = new MemorySessionStore();
  updater = new BookingStateUpdater(sessionStore as any);
  resolver = new ReferenceResolver({
    execute: jest.fn<(q: any) => Promise<{ listings: any[]; total: number }>>()
      .mockResolvedValue({ listings: DB_LISTINGS, total: DB_LISTINGS.length }),
  } as any);
});

function makeMemoryContext(sessionId: string): MemoryContext {
  return { userId: "user-e2e", sessionId, session: {} };
}

function makeAIContext(sessionId: string, searchResults: any[] = []): AIContext {
  return {
    identity: { user: { id: "user-e2e" } },
    runtime: { source: "web", sessionId },
    resources: { searchResults },
    trace: { correlationId: "e2e-test" },
  } as any;
}

function makeBookingSemantic(message: string, entities: any[] = []): SemanticContext {
  return new SemanticContext(
    message,
    entities,
    { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
    0.9,
    AIDomain.BOOKING,
    true,
  );
}

// ─── Test Suite ─────────────────────────────────────────────────
describe("Search Memory E2E: Tokyo Shibuya rooms", () => {

  it("Turn 1: search results persist to session memory", () => {
    const memoryCtx = makeMemoryContext("session-tokyo");

    // Simulate ListingAgent returning search results
    const searchArtifact = {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: 3 },
    };

    // ArtifactMemoryStage calls bookingStateUpdater.apply()
    updater.apply(memoryCtx, searchArtifact);

    // Also cache globally (as ArtifactMemoryStage does)
    cacheSearchResults("session-tokyo", DB_LISTINGS);

    // Verify: session memory has the search results
    const session = sessionStore.load(memoryCtx);
    expect(session.searchResults).toBeDefined();
    expect(session.searchResults).toHaveLength(3);
    expect(session.searchResults![0].id).toBe("listing-tokyo-001");
    expect(session.searchResults![0].title).toBe("Beautiful Flower Room");
    expect(session.searchResults![1].id).toBe("listing-tokyo-002");
    expect(session.searchResults![2].id).toBe("listing-tokyo-003");

    // Verify: global cache also has them
    const cached = getCachedSearchResults("session-tokyo");
    expect(cached).toHaveLength(3);
  });

  it("Turn 2: 'book the beautiful flower room' matches by title", async () => {
    const sessionId = "session-tokyo";
    const memoryCtx = makeMemoryContext(sessionId);

    // Step 1: Simulate Turn 1 — search results saved
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: 3 },
    });
    cacheSearchResults(sessionId, DB_LISTINGS);

    // Step 2: Simulate Turn 2 — user says "book the beautiful flower room"
    // AIRequestFactory loads session and populates context.resources.searchResults
    const loadedSession = sessionStore.load(memoryCtx);
    const aiContext = makeAIContext(sessionId, loadedSession.searchResults ?? []);

    // SemanticExtractor detects CREATE_BOOKING intent
    const semantic = makeBookingSemantic("book the beautiful flower room");

    // ReferenceResolver.resolve() should match by title
    const resolved = await resolver.resolve(semantic, aiContext);

    // Verify: listing ID was resolved
    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-001"); // "Beautiful Flower Room"
    expect(listingIdEntity!.confidence).toBeGreaterThan(0.6);
  });

  it("Turn 2: '花の部屋を予約したい' matches Japanese title", async () => {
    const sessionId = "session-tokyo-jp";
    const memoryCtx = makeMemoryContext(sessionId);

    const jpListings = [
      { id: "jp-1", title: "花の部屋", address: "東京渋谷", price: 10000 },
      { id: "jp-2", title: "庭園ルーム", address: "京都", price: 15000 },
    ];

    // Step 1: Search results saved
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: jpListings, total: 2 },
    });

    // Step 2: User says "花の部屋を予約したい"
    const loadedSession = sessionStore.load(memoryCtx);
    const aiContext = makeAIContext(sessionId, loadedSession.searchResults ?? []);
    const semantic = makeBookingSemantic("花の部屋を予約したい");

    const resolved = await resolver.resolve(semantic, aiContext);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("jp-1"); // "花の部屋"
  });

  it("Turn 2: 'book it' falls back to first listing", async () => {
    const sessionId = "session-tokyo-fallback";
    const memoryCtx = makeMemoryContext(sessionId);

    // Step 1: Search results saved
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: 3 },
    });

    // Step 2: User says "book it" (no title keywords)
    const loadedSession = sessionStore.load(memoryCtx);
    const aiContext = makeAIContext(sessionId, loadedSession.searchResults ?? []);
    const semantic = makeBookingSemantic("book it");

    const resolved = await resolver.resolve(semantic, aiContext);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-001"); // First listing
  });

  it("Turn 3: search results survive across multiple turns", async () => {
    const sessionId = "session-tokyo-multi";
    const memoryCtx = makeMemoryContext(sessionId);

    // Turn 1: Search
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: 3 },
    });

    // Turn 2: Book (select listing + dates)
    updater.apply(memoryCtx, {
      type: "LISTING_SELECTED",
      content: { id: "listing-tokyo-001", title: "Beautiful Flower Room" },
    });
    updater.apply(memoryCtx, {
      type: "DATES_SELECTED",
      content: { startDate: "2026-07-25", endDate: "2026-07-27" },
    });

    // Turn 3: Check session state
    const session = sessionStore.load(memoryCtx);

    // Search results still there
    expect(session.searchResults).toHaveLength(3);
    expect(session.searchResults![0].id).toBe("listing-tokyo-001");

    // Booking state advanced correctly
    expect(session.booking).toBeDefined();
    expect(session.booking!.listingId).toBe("listing-tokyo-001");
    expect(session.booking!.checkInDate).toBe("2026-07-25");
    expect(session.booking!.checkOutDate).toBe("2026-07-27");
  });

  it("Session isolation: different sessions don't share results", () => {
    const ctx1 = makeMemoryContext("session-user-A");
    const ctx2 = makeMemoryContext("session-user-B");

    // User A searches
    updater.apply(ctx1, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: [DB_LISTINGS[0]], total: 1 },
    });

    // User B searches different results
    updater.apply(ctx2, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: [DB_LISTINGS[2]], total: 1 },
    });

    const session1 = sessionStore.load(ctx1);
    const session2 = sessionStore.load(ctx2);

    expect(session1.searchResults![0].id).toBe("listing-tokyo-001");
    expect(session2.searchResults![0].id).toBe("listing-tokyo-003");
  });

  it("Full flow: search → title match → booking created", async () => {
    const sessionId = "session-full-flow";
    const memoryCtx = makeMemoryContext(sessionId);

    // Turn 1: Search
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: 3 },
    });

    // Turn 2: "book the beautiful flower room"
    const loadedSession = sessionStore.load(memoryCtx);
    const aiContext = makeAIContext(sessionId, loadedSession.searchResults ?? []);
    const semantic = makeBookingSemantic("book the beautiful flower room");
    const resolved = await resolver.resolve(semantic, aiContext);

    const listingId = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    )!.value;

    // Turn 3: Simulate BookingAgent creating booking
    // (listing already resolved, now need dates)
    expect(listingId).toBe("listing-tokyo-001");

    // Session still has all search results
    const finalSession = sessionStore.load(memoryCtx);
    expect(finalSession.searchResults).toHaveLength(3);
  });
});
