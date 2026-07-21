import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock("@/modules/tokens/listing.tokens", () => ({
  TOKENS_LISTING: {
    repos: {
      listingRepository: Symbol.for("ListingRepository"),
    },
    usecase: {
      getListingByIdUseCase: Symbol.for("GetListingByIdUseCase"),
      getFeaturedListingsUseCase: Symbol.for("GetFeaturedListingsUseCase"),
      createListingUseCase: Symbol.for("CreateListingUseCase"),
    },
  },
}));

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

import { resolvers } from "@/subgraphs/listing/resolvers/listing.resolver";
import { container } from "tsyringe";

describe("Listing Resolvers", () => {
  let mockRepo: any;
  let mockGetListingById: any;
  let mockGetFeaturedListings: any;
  let mockCreateListing: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepo = {
      findAll: jest.fn(),
      findByOwnerId: jest.fn(),
    };
    mockGetListingById = { execute: jest.fn() };
    mockGetFeaturedListings = { execute: jest.fn() };
    mockCreateListing = { execute: jest.fn() };

    (container.resolve as jest.Mock).mockImplementation((token: symbol) => {
      if (token === Symbol.for("ListingRepository")) return mockRepo;
      if (token === Symbol.for("GetListingByIdUseCase")) return mockGetListingById;
      if (token === Symbol.for("GetFeaturedListingsUseCase")) return mockGetFeaturedListings;
      if (token === Symbol.for("CreateListingUseCase")) return mockCreateListing;
      return null;
    });
  });

  describe("Query.listings", () => {
    it("should return all listings", async () => {
      const mockListings = [
        { id: "listing-1", title: "Tokyo Hotel" },
        { id: "listing-2", title: "Osaka Hotel" },
      ];
      mockRepo.findAll.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.listings();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockListings);
    });

    it("should return empty array when no listings", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await (resolvers as any).Query.listings();

      expect(result).toEqual([]);
    });
  });

  describe("Query.listing", () => {
    it("should return a listing by ID", async () => {
      const mockListing = { id: "listing-1", title: "Tokyo Hotel" };
      mockGetListingById.execute.mockResolvedValue(mockListing);

      const result = await (resolvers as any).Query.listing(
        null,
        { id: "listing-1" }
      );

      expect(mockGetListingById.execute).toHaveBeenCalledWith("listing-1");
      expect(result).toEqual(mockListing);
    });

    it("should return null when listing not found", async () => {
      mockGetListingById.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Query.listing(
        null,
        { id: "missing" }
      );

      expect(result).toBeNull();
    });
  });

  describe("Query.featuredListings", () => {
    it("should return featured listings with limit", async () => {
      const mockListings = [
        { id: "listing-1", title: "Featured Hotel", isFeatured: true },
      ];
      mockGetFeaturedListings.execute.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.featuredListings(
        null,
        { limit: 5 }
      );

      expect(mockGetFeaturedListings.execute).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockListings);
    });

    it("should pass undefined limit when not provided", async () => {
      mockGetFeaturedListings.execute.mockResolvedValue([]);

      await (resolvers as any).Query.featuredListings(null, {});

      expect(mockGetFeaturedListings.execute).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Query.listingsByOwner", () => {
    it("should return listings for an owner", async () => {
      const mockListings = [
        { id: "listing-1", ownerId: "owner-1" },
        { id: "listing-2", ownerId: "owner-1" },
      ];
      mockRepo.findByOwnerId.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.listingsByOwner(
        null,
        { ownerId: "owner-1" }
      );

      expect(mockRepo.findByOwnerId).toHaveBeenCalledWith("owner-1");
      expect(result).toEqual(mockListings);
    });
  });

  describe("Mutation.createListing", () => {
    it("should create a new listing", async () => {
      const input = {
        title: "New Hotel",
        description: "A beautiful hotel",
        address: "123 Tokyo St",
        ownerId: "owner-1",
        locationId: "loc-1",
        pricePerNight: 100,
        categories: ["cat-1"],
      };

      const mockListing = { id: "listing-new", ...input };
      mockCreateListing.execute.mockResolvedValue(mockListing);

      const result = await (resolvers as any).Mutation.createListing(
        null,
        { input }
      );

      expect(mockCreateListing.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockListing);
    });
  });

  describe("Listing.__resolveReference", () => {
    it("should resolve listing reference by ID", async () => {
      const mockListing = { id: "listing-1", title: "Tokyo Hotel" };
      mockGetListingById.execute.mockResolvedValue(mockListing);

      const result = await (resolvers as any).Listing.__resolveReference(
        { id: "listing-1" }
      );

      expect(mockGetListingById.execute).toHaveBeenCalledWith("listing-1");
      expect(result).toEqual(mockListing);
    });

    it("should return null when listing not found", async () => {
      mockGetListingById.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Listing.__resolveReference(
        { id: "missing" }
      );

      expect(result).toBeNull();
    });

    it("should return null when use case throws", async () => {
      mockGetListingById.execute.mockRejectedValue(new Error("Not found"));

      const result = await (resolvers as any).Listing.__resolveReference(
        { id: "error-listing" }
      );

      expect(result).toBeNull();
    });
  });

  describe("Listing.owner", () => {
    it("should return User reference with ownerId", () => {
      const parent = { id: "listing-1", ownerId: "owner-1" };

      const result = (resolvers as any).Listing.owner(parent);

      expect(result).toEqual({
        __typename: "User",
        id: "owner-1",
      });
    });
  });

  describe("Listing.categories", () => {
    it("should return Category references from category IDs", () => {
      const parent = { id: "listing-1", categories: ["cat-1", "cat-2"] };

      const result = (resolvers as any).Listing.categories(parent);

      expect(result).toEqual([
        { __typename: "Category", id: "cat-1" },
        { __typename: "Category", id: "cat-2" },
      ]);
    });

    it("should return empty array when no categories", () => {
      const parent = { id: "listing-1" };

      const result = (resolvers as any).Listing.categories(parent);

      expect(result).toEqual([]);
    });

    it("should return empty array when categories is null", () => {
      const parent = { id: "listing-1", categories: null };

      const result = (resolvers as any).Listing.categories(parent);

      expect(result).toEqual([]);
    });
  });

  describe("Listing.amenities", () => {
    it("should return Amenity references from amenityIds", () => {
      const parent = { id: "listing-1", amenityIds: ["amenity-1", "amenity-2"] };

      const result = (resolvers as any).Listing.amenities(parent);

      expect(result).toEqual([
        { __typename: "Amenity", id: "amenity-1" },
        { __typename: "Amenity", id: "amenity-2" },
      ]);
    });

    it("should return empty array when no amenityIds", () => {
      const parent = { id: "listing-1" };

      const result = (resolvers as any).Listing.amenities(parent);

      expect(result).toEqual([]);
    });
  });

  describe("Owner.listings", () => {
    it("should return listings for an owner", async () => {
      const mockListings = [
        { id: "listing-1", ownerId: "owner-1" },
      ];
      mockRepo.findByOwnerId.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Owner.listings(
        { id: "owner-1" }
      );

      expect(mockRepo.findByOwnerId).toHaveBeenCalledWith("owner-1");
      expect(result).toEqual(mockListings);
    });
  });
});
