import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { BookingStateUpdater } from "@/wisdom/memory/booking-state-updater";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { ListingReferenceResolver } from "@/wisdom/reference/IlistingReference-resolver";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { AIContext } from "@/wisdom/contracts/ai-context";
import { MemoryContext } from "@/wisdom/memory/type/memory-context";

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
let resolver: ListingReferenceResolver;

beforeEach(() => {
  jest.clearAllMocks();
  sessionStore = new MemorySessionStore();
  updater = new BookingStateUpdater(sessionStore as any);
  resolver = new ListingReferenceResolver({
    execute: jest.fn<(q: any) => Promise<{ listings: any[]; total: number }>>()
      .mockResolvedValue({ listings: DB_LISTINGS, total: DB_LISTINGS.length }),
  } as any);
});

function makeMemoryContext(sessionId: string): MemoryContext {
  return { userId: "user-e2e", sessionId, session: {} as any };
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
    const memoryCtx = makeMemoryContext("e2e-session");
    const aiCtx = makeAIContext("e2e-session");

    // Simulate search result artifact
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: DB_LISTINGS.length },
    });

    // Verify persisted
    const session = sessionStore.get(memoryCtx.sessionId);
    expect(session).toBeDefined();
    expect(session!.searchResults).toHaveLength(3);
    expect(session!.searchResults![0].id).toBe("listing-tokyo-001");
  });

  it("Turn 2: 'book the beautiful flower room' matches by title", async () => {
    const memoryCtx = makeMemoryContext("e2e-session");
    const aiCtx = makeAIContext("e2e-session", DB_LISTINGS);

    const semantic = makeBookingSemantic("book the beautiful flower room");
    const resolved = await resolver.resolve(semantic, aiCtx);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-001");
  });

  it("Turn 2: '花の部屋を予約したい' matches Japanese title", async () => {
    const aiCtx = makeAIContext("e2e-session", DB_LISTINGS);

    const semantic = makeBookingSemantic("花の部屋を予約したい");
    const resolved = await resolver.resolve(semantic, aiCtx);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-001");
  });

  it("Turn 2: 'book it' falls back to first listing", async () => {
    const aiCtx = makeAIContext("e2e-session", DB_LISTINGS);

    // "book it" with no ordinal entity → title match fails → fallback to first
    const semantic = makeBookingSemantic("book it");
    const resolved = await resolver.resolve(semantic, aiCtx);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-001");
  });

  it("Turn 3: search results survive across multiple turns", () => {
    const memoryCtx = makeMemoryContext("e2e-session");

    // Turn 1: search
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: DB_LISTINGS.length },
    });

    // Turn 2: listing selected (doesn't clear search results)
    updater.apply(memoryCtx, {
      type: "LISTING_SELECTED",
      content: { listingId: "listing-tokyo-001" },
    });

    // Turn 3: verify search results still there
    const session = sessionStore.get(memoryCtx.sessionId);
    expect(session).toBeDefined();
    expect(session!.searchResults).toHaveLength(3);
    expect(session!.bookingDraft).toBeDefined();
    expect(session!.bookingDraft!.listingId).toBe("listing-tokyo-001");
  });

  it("Session isolation: different sessions don't share results", () => {
    const ctx1 = makeMemoryContext("session-a");
    const ctx2 = makeMemoryContext("session-b");

    updater.apply(ctx1, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: [DB_LISTINGS[0]], total: 1 },
    });

    updater.apply(ctx2, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: [DB_LISTINGS[2]], total: 1 },
    });

    const s1 = sessionStore.get(ctx1.sessionId);
    const s2 = sessionStore.get(ctx2.sessionId);

    expect(s1!.searchResults![0].id).toBe("listing-tokyo-001");
    expect(s2!.searchResults![0].id).toBe("listing-tokyo-003");
  });

  it("Full flow: search → title match → booking created", async () => {
    const memoryCtx = makeMemoryContext("e2e-full");
    const aiCtx = makeAIContext("e2e-full");

    // Step 1: Search results arrive
    updater.apply(memoryCtx, {
      type: "LISTING_SEARCH_RESULT",
      content: { listings: DB_LISTINGS, total: DB_LISTINGS.length },
    });

    // Step 2: User says "book the garden view room"
    aiCtx.resources.searchResults = DB_LISTINGS;
    const semantic = makeBookingSemantic("book the garden view room");
    const resolved = await resolver.resolve(semantic, aiCtx);

    const listingIdEntity = resolved.entities.find(
      (e) => e.type === EntityType.LISTING_ID,
    );
    expect(listingIdEntity).toBeDefined();
    expect(listingIdEntity!.value).toBe("listing-tokyo-002");

    // Step 3: Apply listing selection
    updater.apply(memoryCtx, {
      type: "LISTING_SELECTED",
      content: { listingId: listingIdEntity!.value },
    });

    // Step 4: Verify final state
    const session = sessionStore.get(memoryCtx.sessionId);
    expect(session).toBeDefined();
    expect(session!.bookingDraft).toBeDefined();
    expect(session!.bookingDraft!.listingId).toBe("listing-tokyo-002");
    expect(session!.searchResults).toHaveLength(3);
  });
});
