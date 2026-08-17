import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock ESM-only graphql-upload before any resolver imports
jest.mock("graphql-upload/GraphQLUpload.mjs", () => ({
  __esModule: true,
  default: { name: "Upload", description: "GraphQL file upload scalar" },
}));

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

function makeMockListing(overrides: any = {}) {
  return {
    id: "listing-1",
    ownerId: "owner-1",
    locationId: "loc-1",
    title: "Tokyo Hotel",
    description: "A nice hotel",
    address: "123 Tokyo St",
    price: 10000,
    pricePerNight: 10000,
    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 2,
    isFeatured: false,
    categories: [],
    amenityIds: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    pictures: [
      { toJson: () => ({ url: "http://example.com/pic1.jpg", isPrimary: true }) },
    ],
    ...overrides,
  };
}

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
        makeMockListing({ id: "listing-1", title: "Tokyo Hotel" }),
        makeMockListing({ id: "listing-2", title: "Osaka Hotel" }),
      ];
      mockRepo.findAll.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.listings();

      expect(mockRepo.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("listing-1");
      expect(result[0].pictures).toEqual([{ url: "http://example.com/pic1.jpg", isPrimary: true }]);
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
  });

  describe("Query.listingsByOwner", () => {
    it("should return listings for a given owner", async () => {
      const mockListings = [
        makeMockListing({ id: "listing-1", title: "My Hotel" }),
      ];
      mockRepo.findByOwnerId.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.listingsByOwner(
        null,
        { ownerId: "owner-1" }
      );

      expect(mockRepo.findByOwnerId).toHaveBeenCalledWith("owner-1");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("listing-1");
    });
  });
});
