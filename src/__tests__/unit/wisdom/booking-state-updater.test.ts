import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { BookingStateUpdater } from "@/wisdom/memory/booking-state-updater";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { MemoryContext } from "@/wisdom/memory/type/memory-context";
import { BookingState } from "@/core/booking/domain/state/booking-state";

describe("BookingStateUpdater", () => {
  let updater: BookingStateUpdater;
  let sessionStore: MemorySessionStore;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStore = new MemorySessionStore();
    updater = new BookingStateUpdater(sessionStore as any);
  });

  function makeMemoryContext(sessionId = "test-session"): MemoryContext {
    return {
      userId: "user-1",
      sessionId,
      session: {},
    };
  }

  describe("search result persistence", () => {
    it("should save search results to session memory", () => {
      const ctx = makeMemoryContext();
      const listings = [
        { id: "listing-1", title: "Flower Room", address: "Tokyo", price: 10000 },
        { id: "listing-2", title: "Garden Room", address: "Kyoto", price: 15000 },
      ];

      const artifact = {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 2 },
      };

      updater.apply(ctx, artifact);

      // Verify search results are saved to session
      const savedSession = sessionStore.load(ctx);
      expect(savedSession.searchResults).toEqual(listings);
    });

    it("should persist search results that can be retrieved on next turn", () => {
      const ctx = makeMemoryContext();
      const listings = [
        { id: "listing-1", title: "Flower Room", address: "Tokyo", price: 10000 },
      ];

      // Simulate search
      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 1 },
      });

      // Simulate next turn - load session and verify results are there
      const newCtx = makeMemoryContext(); // Same session ID
      const loadedSession = sessionStore.load(newCtx);

      expect(loadedSession.searchResults).toHaveLength(1);
      expect(loadedSession.searchResults![0].id).toBe("listing-1");
      expect(loadedSession.searchResults![0].title).toBe("Flower Room");
    });

    it("should update search results when new search is performed", () => {
      const ctx = makeMemoryContext();

      // First search
      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [{ id: "listing-1", title: "Room A" }],
          total: 1,
        },
      });

      // Second search with different results
      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [
            { id: "listing-2", title: "Room B" },
            { id: "listing-3", title: "Room C" },
          ],
          total: 2,
        },
      });

      const session = sessionStore.load(ctx);
      expect(session.searchResults).toHaveLength(2);
      expect(session.searchResults![0].id).toBe("listing-2");
      expect(session.searchResults![1].id).toBe("listing-3");
    });

    it("should persist search results even when artifact is not a booking event", () => {
      const ctx = makeMemoryContext();
      const listings = [{ id: "listing-1", title: "Test Room" }];

      // LISTING_SEARCH_RESULT is not a booking transition event
      // (it's commented out in ArtifactTransitionMapper)
      // But we still need to persist the search results
      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 1 },
      });

      // Verify the session was saved
      const session = sessionStore.load(ctx);
      expect(session.searchResults).toEqual(listings);
    });
  });

  describe("booking state transitions", () => {
    it("should set booking state to AWAITING_DATES after LISTING_SELECTED", () => {
      const ctx = makeMemoryContext();

      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: { id: "listing-1", title: "Flower Room" },
      });

      const session = sessionStore.load(ctx);
      expect(session.booking).toBeDefined();
      expect(session.booking!.status).toBe(BookingState.AWAITING_DATES);
    });

    it("should update booking draft with dates after DATES_SELECTED", () => {
      const ctx = makeMemoryContext();

      // First select a listing
      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: { id: "listing-1" },
      });

      // Then select dates
      updater.apply(ctx, {
        type: "DATES_SELECTED",
        content: { startDate: "2026-07-25", endDate: "2026-07-27" },
      });

      const session = sessionStore.load(ctx);
      expect(session.booking!.status).toBe(BookingState.AWAITING_CUSTOMER_COUNT);
    });

    it("should handle complete booking flow", () => {
      const ctx = makeMemoryContext();

      // 1. Search results
      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [{ id: "listing-1", title: "Flower Room" }],
          total: 1,
        },
      });

      // 2. Select listing
      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: { id: "listing-1", title: "Flower Room" },
      });

      // 3. Select dates
      updater.apply(ctx, {
        type: "DATES_SELECTED",
        content: { startDate: "2026-07-25", endDate: "2026-07-27" },
      });

      // 4. Set customer count
      updater.apply(ctx, {
        type: "CUSTOMER_COUNT_SELECTED",
        content: { customerCount: 2 },
      });

      // 5. Create booking (CONFIRM event requires dates + customer count)
      updater.apply(ctx, {
        type: "BOOKING_CREATED",
        content: { bookingId: "booking-123" },
      });

      const session = sessionStore.load(ctx);
      expect(session.searchResults).toHaveLength(1);
      expect(session.booking!.status).toBe(BookingState.BOOKING_PENDING);
    });
  });

  describe("isolated sessions", () => {
    it("should not share search results between different sessions", () => {
      const ctx1 = makeMemoryContext("session-1");
      const ctx2 = makeMemoryContext("session-2");

      updater.apply(ctx1, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [{ id: "listing-1", title: "Room A" }],
          total: 1,
        },
      });

      updater.apply(ctx2, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [{ id: "listing-2", title: "Room B" }],
          total: 1,
        },
      });

      const session1 = sessionStore.load(ctx1);
      const session2 = sessionStore.load(ctx2);

      expect(session1.searchResults![0].id).toBe("listing-1");
      expect(session2.searchResults![0].id).toBe("listing-2");
    });
  });
});
