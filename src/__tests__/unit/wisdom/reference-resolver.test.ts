import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

import { ReferenceResolver } from "@/wisdom/reference/reference-resolver";
import { SemanticContext } from "@/wisdom/semantic/semantic-context";
import { EntityType } from "@/wisdom/shared/enums/entity-type.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";
import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { AIContext } from "@/wisdom/contracts/ai-context";

// Mock SearchListingUseCase
const mockSearchListingUseCase = {
  execute: jest.fn<(query: any) => Promise<{ listings: any[]; total: number }>>()
    .mockResolvedValue({ listings: [], total: 0 }),
};

describe("ReferenceResolver", () => {
  let resolver: ReferenceResolver;

  beforeEach(() => {
    jest.clearAllMocks();
    resolver = new ReferenceResolver(mockSearchListingUseCase as any);
  });

  function makeSearchResults() {
    return [
      { id: "listing-1", title: "Beautiful Flower Room", address: "Tokyo Shibuya", price: 10000, description: "A room with flower decorations" },
      { id: "listing-2", title: "Garden View Room", address: "Kyoto", price: 15000, description: "Overlooking a peaceful garden" },
      { id: "listing-3", title: "Ocean Breeze Suite", address: "Okinawa", price: 20000, description: "Sea view with fresh breeze" },
    ];
  }

  function makeAIContext(searchResults: any[] = []): AIContext {
    return {
      identity: { user: { id: "user-1" } },
      runtime: { source: "web", sessionId: "test-session" },
      resources: { searchResults },
      trace: { correlationId: "test-correlation" },
    } as any;
  }

  function makeBookingSemantic(message: string): SemanticContext {
    return new SemanticContext(
      message,
      [],
      { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
      0.9,
      AIDomain.BOOKING,
      true,
    );
  }

  describe("title-based matching", () => {
    it("should match 'book the beautiful flower room' to the correct listing", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = makeBookingSemantic("book the beautiful flower room");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-1");
    });

    it("should match 'book the garden room' to the correct listing", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = makeBookingSemantic("book the garden room");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-2");
    });

    it("should match 'book the ocean suite' to the correct listing", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = makeBookingSemantic("book the ocean suite");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-3");
    });

    it("should match Japanese input '花の部屋を予約したい'", async () => {
      const searchResults = [
        { id: "listing-1", title: "花の部屋", address: "東京", price: 10000 },
        { id: "listing-2", title: "庭園ルーム", address: "京都", price: 15000 },
      ];
      const context = makeAIContext(searchResults);
      const semantic = makeBookingSemantic("花の部屋を予約したい");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-1");
    });

    it("should fall back to first listing when no title matches", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = makeBookingSemantic("book it");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-1"); // First listing
    });

    it("should not match when no search results exist", async () => {
      const context = makeAIContext([]);
      const semantic = makeBookingSemantic("book the flower room");

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeUndefined();
    });
  });

  describe("ordinal matching", () => {
    it("should match 'book the first one' to the first listing", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = new SemanticContext(
        "book the first one",
        [{ type: EntityType.ORDINAL, value: "first", confidence: 0.95 }],
        { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
        0.9,
        AIDomain.BOOKING,
        true,
      );

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-1");
    });

    it("should match 'book the second one' to the second listing", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = new SemanticContext(
        "book the second one",
        [{ type: EntityType.ORDINAL, value: "second", confidence: 0.95 }],
        { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
        0.9,
        AIDomain.BOOKING,
        true,
      );

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-2");
    });
  });

  describe("explicit listing ID", () => {
    it("should not override explicit listing ID", async () => {
      const searchResults = makeSearchResults();
      const context = makeAIContext(searchResults);
      const semantic = new SemanticContext(
        "book listing-3",
        [{ type: EntityType.LISTING_ID, value: "listing-3", confidence: 0.95 }],
        { type: AgentAction.CREATE_BOOKING, confidence: 0.9 },
        0.9,
        AIDomain.BOOKING,
        true,
      );

      const resolved = await resolver.resolve(semantic, context);

      const listingIdEntity = resolved.entities.find(
        (e) => e.type === EntityType.LISTING_ID,
      );
      expect(listingIdEntity).toBeDefined();
      expect(listingIdEntity!.value).toBe("listing-3");
    });
  });
});
