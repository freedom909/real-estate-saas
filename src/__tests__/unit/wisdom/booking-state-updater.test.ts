import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { BookingStateUpdater } from "@/wisdom/memory/booking-state-updater";
import { MemorySessionStore } from "@/wisdom/memory/session/session-memory.store";
import { MemoryContext } from "@/wisdom/memory/type/memory-context";

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
      session: {} as any,
    };
  }

  describe("search result persistence", () => {
    it("should save search results to session memory", () => {
      const ctx = makeMemoryContext();
      const listings = [
        { id: "listing-1", title: "Flower Room", address: "Tokyo", price: 10000 },
        { id: "listing-2", title: "Garden Room", address: "Kyoto", price: 15000 },
      ];

      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 2 },
      });

      const savedSession = sessionStore.get(ctx.sessionId);
      expect(savedSession).toBeDefined();
      expect(savedSession!.searchResults).toEqual(listings);
    });

    it("should persist search results that can be retrieved on next turn", () => {
      const ctx = makeMemoryContext();
      const listings = [
        { id: "listing-1", title: "Flower Room", address: "Tokyo", price: 10000 },
      ];

      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 1 },
      });

      const loadedSession = sessionStore.get(ctx.sessionId);
      expect(loadedSession).toBeDefined();
      expect(loadedSession!.searchResults).toHaveLength(1);
      expect(loadedSession!.searchResults![0].id).toBe("listing-1");
      expect(loadedSession!.searchResults![0].title).toBe("Flower Room");
    });

    it("should update search results when new search is performed", () => {
      const ctx = makeMemoryContext();

      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: {
          listings: [{ id: "listing-1", title: "Room A" }],
          total: 1,
        },
      });

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

      const session = sessionStore.get(ctx.sessionId);
      expect(session).toBeDefined();
      expect(session!.searchResults).toHaveLength(2);
      expect(session!.searchResults![0].id).toBe("listing-2");
      expect(session!.searchResults![1].id).toBe("listing-3");
    });

    it("should persist search results even when artifact is not a booking event", () => {
      const ctx = makeMemoryContext();
      const listings = [{ id: "listing-1", title: "Test Room" }];

      updater.apply(ctx, {
        type: "LISTING_SEARCH_RESULT",
        content: { listings, total: 1 },
      });

      const session = sessionStore.get(ctx.sessionId);
      expect(session).toBeDefined();
      expect(session!.searchResults).toEqual(listings);
    });
  });

  describe("booking state transitions", () => {
    it("should set booking draft with listingId after LISTING_SELECTED", () => {
      const ctx = makeMemoryContext();

      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: { listingId: "listing-1" },
      });

      const session = sessionStore.get(ctx.sessionId);
      expect(session).toBeDefined();
      expect(session!.bookingDraft).toBeDefined();
      expect(session!.bookingDraft!.listingId).toBe("listing-1");
    });

    it("should handle LISTING_SELECTED with dates in payload", () => {
      const ctx = makeMemoryContext();

      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: {
          listingId: "listing-1",
          checkInDate: "2024-06-01",
          checkOutDate: "2024-06-04",
          customerCount: 2,
        },
      });

      const session = sessionStore.get(ctx.sessionId);
      expect(session).toBeDefined();
      expect(session!.bookingDraft).toBeDefined();
      expect(session!.bookingDraft!.listingId).toBe("listing-1");
      expect(session!.bookingDraft!.checkInDate).toBe("2024-06-01");
      expect(session!.bookingDraft!.checkOutDate).toBe("2024-06-04");
      expect(session!.bookingDraft!.customerCount).toBe(2);
    });

    it("should handle complete booking flow with LISTING_SELECTED", () => {
      const ctx = makeMemoryContext();

      updater.apply(ctx, {
        type: "LISTING_SELECTED",
        content: {
          listingId: "listing-1",
          checkInDate: "2024-06-01",
          checkOutDate: "2024-06-04",
          customerCount: 2,
        },
      });

      const session = sessionStore.get(ctx.sessionId);
      expect(session).toBeDefined();
      expect(session!.bookingDraft).toBeDefined();
      expect(session!.bookingDraft!.listingId).toBe("listing-1");
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

      const session1 = sessionStore.get(ctx1.sessionId);
      const session2 = sessionStore.get(ctx2.sessionId);

      expect(session1).toBeDefined();
      expect(session2).toBeDefined();
      expect(session1!.searchResults![0].id).toBe("listing-1");
      expect(session2!.searchResults![0].id).toBe("listing-2");
    });
  });
});
