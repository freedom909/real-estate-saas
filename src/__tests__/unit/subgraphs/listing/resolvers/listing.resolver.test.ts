import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// ============================================================
// Mock ESM-only graphql-upload before resolver import
// ============================================================

jest.mock("graphql-upload/GraphQLUpload.mjs", () => ({
  __esModule: true,
  default: {
    name: "Upload",
    description: "GraphQL file upload scalar",
  },
}));

// ============================================================
// Mock Listing tokens
// ============================================================

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

// ============================================================
// Mock tsyringe
// ============================================================

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

// ============================================================
// Mock AuthorizationIdentity resolver
//
// Resolver authorization is tested here, but membership lookup
// itself belongs to another unit/integration boundary.
// ============================================================

jest.mock(
  "@/core/authorization/authorizationIdentity.resolver",
  () => ({
    resolveAuthorizationIdentity: jest.fn(),
  }),
);

// ============================================================
// Imports
// ============================================================

import { resolvers } from "@/subgraphs/listing/resolvers/listing.resolver";
import { container } from "tsyringe";
import { resolveAuthorizationIdentity } from "@/core/authorization/authorizationIdentity.resolver";

import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";

// ============================================================
// Helpers
// ============================================================

function makeMockListing(overrides: any = {}) {
  return {
    id: "listing-1",
    ownerId: "owner-1",
    tenantId: "tenant-kyoto",
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

    categoryIds: [],
    amenityIds: [],

    createdAt: new Date(),
    updatedAt: new Date(),

    pictures: [
      {
        toJson: () => ({
          url: "http://example.com/pic1.jpg",
          isPrimary: true,
        }),
      },
    ],

    ...overrides,
  };
}

function makeCreateListingInput(overrides: any = {}) {
  return {
    title: "Kyoto Guest House",
    description: "A beautiful guest house in Kyoto",

    tenantId: "tenant-tokyo",

    locationId: "location-1",

    categories: [],

    amenityIds: [],

    ownerId: "forged-owner",

    numOfBeds: 2,
    numOfCustomers: 4,
    numOfBathrooms: 1,
    numOfRooms: 2,

    isFeatured: false,

    pricePerNight: 15000,

    pictures: [
      {
        objectKey: "listing-images/kyoto-1.jpg",
        mimeType: "image/jpeg",
        size: 1000,
      },
    ],

    ...overrides,
  };
}

function makeContext(overrides: any = {}) {
  return {
    user: {
      userId: "alice-user",
      role: GlobalRole.CUSTOMER,
      tenantId: "tenant-kyoto",
      ...overrides,
    },
  };
}

function mockIdentity(overrides: any = {}) {
  (resolveAuthorizationIdentity as jest.Mock).mockResolvedValue({
    userId: "alice-user",
    globalRole: GlobalRole.CUSTOMER,
    tenantId: "tenant-kyoto",
    membershipRole: MembershipRole.HOST,
    ...overrides,
  });
}

// ============================================================
// Test Suite
// ============================================================

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

    mockGetListingById = {
      execute: jest.fn(),
    };

    mockGetFeaturedListings = {
      execute: jest.fn(),
    };

    mockCreateListing = {
      execute: jest.fn(),
    };

    (container.resolve as jest.Mock).mockImplementation(
      (token: symbol) => {
        if (token === Symbol.for("ListingRepository")) {
          return mockRepo;
        }

        if (token === Symbol.for("GetListingByIdUseCase")) {
          return mockGetListingById;
        }

        if (token === Symbol.for("GetFeaturedListingsUseCase")) {
          return mockGetFeaturedListings;
        }

        if (token === Symbol.for("CreateListingUseCase")) {
          return mockCreateListing;
        }

        return null;
      },
    );

    mockCreateListing.execute.mockResolvedValue(
      makeMockListing({
        id: "created-listing",
        ownerId: "alice-user",
        tenantId: "tenant-kyoto",
      }),
    );
  });

  // ==========================================================
  // Query.listings
  // ==========================================================

  describe("Query.listings", () => {
    it("should return all listings", async () => {
      const mockListings = [
        makeMockListing({
          id: "listing-1",
          title: "Tokyo Hotel",
        }),
        makeMockListing({
          id: "listing-2",
          title: "Osaka Hotel",
        }),
      ];

      mockRepo.findAll.mockResolvedValue(mockListings);

      const result = await (resolvers as any).Query.listings();

      expect(mockRepo.findAll).toHaveBeenCalled();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("listing-1");

      expect(result[0].pictures).toEqual([
        {
          url: "http://example.com/pic1.jpg",
          isPrimary: true,
        },
      ]);
    });

    it("should return empty array when no listings", async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await (resolvers as any).Query.listings();

      expect(result).toEqual([]);
    });
  });

  // ==========================================================
  // Query.listing
  // ==========================================================

  describe("Query.listing", () => {
    it("should return a listing by ID", async () => {
      const mockListing = {
        id: "listing-1",
        title: "Tokyo Hotel",
      };

      mockGetListingById.execute.mockResolvedValue(mockListing);

      const result = await (resolvers as any).Query.listing(
        null,
        {
          id: "listing-1",
        },
      );

      expect(mockGetListingById.execute).toHaveBeenCalledWith(
        "listing-1",
      );

      expect(result).toEqual(mockListing);
    });

    it("should return null when listing not found", async () => {
      mockGetListingById.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Query.listing(
        null,
        {
          id: "missing",
        },
      );

      expect(result).toBeNull();
    });
  });

  // ==========================================================
  // Query.featuredListings
  // ==========================================================

  // describe("Query.featuredListings", () => {
  //   it("should return featured listings with limit", async () => {
  //     const mockListings = [
  //       {
  //         id: "listing-1",
  //         title: "Featured Hotel",
  //         isFeatured: true,
  //       },
  //     ];

  //     mockGetFeaturedListings.execute.mockResolvedValue(
  //       mockListings,
  //     );

  //     const result =
  //       await (resolvers as any).Query.featuredListings(
  //         null,
  //         {
  //           limit: 5,
  //         },
  //       );

  //     expect(
  //       mockGetFeaturedListings.execute,
  //     ).toHaveBeenCalledWith(5);

  //     expect(result).toEqual(mockListings);
  //   });
  // });

  // ==========================================================
  // Query.listingsByOwner
  // ==========================================================

  describe("Query.listingsByOwner", () => {
    it("should return current user's listings within active tenant", async () => {
      const mockListings = [
        makeMockListing({
          id: "listing-1",
          ownerId: "alice-user",
          tenantId: "tenant-kyoto",
          title: "My Kyoto Hotel",
        }),
      ];

      mockRepo.findByOwnerId.mockResolvedValue(mockListings);

      const context = makeContext({
        userId: "alice-user",
        tenantId: "tenant-kyoto",
      });

      const result =
        await (resolvers as any).Query.listingsByOwner(
          null,
          {},
          context,
        );

      expect(
        mockRepo.findByOwnerId,
      ).toHaveBeenCalledWith(
        "alice-user",
        "tenant-kyoto",
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("listing-1");
    });

    it("should reject unauthenticated user", async () => {
      await expect(
        (resolvers as any).Query.listingsByOwner(
          null,
          {},
          {},
        ),
      ).rejects.toThrow("User not authenticated");

      expect(
        mockRepo.findByOwnerId,
      ).not.toHaveBeenCalled();
    });

    it("should reject user without active tenant", async () => {
      const context = makeContext({
        tenantId: null,
      });

      await expect(
        (resolvers as any).Query.listingsByOwner(
          null,
          {},
          context,
        ),
      ).rejects.toThrow("Active tenant is required");

      expect(
        mockRepo.findByOwnerId,
      ).not.toHaveBeenCalled();
    });
  });

  // ==========================================================
  // Mutation.createListing
  // ==========================================================

  describe("Mutation.createListing", () => {
    // --------------------------------------------------------
    // Authentication
    // --------------------------------------------------------

    it("should reject unauthenticated user", async () => {
      const input = makeCreateListingInput();

      await expect(
        (resolvers as any).Mutation.createListing(
          null,
          { input },
          {},
        ),
      ).rejects.toThrow("User not authenticated");

      expect(
        resolveAuthorizationIdentity,
      ).not.toHaveBeenCalled();

      expect(
        mockCreateListing.execute,
      ).not.toHaveBeenCalled();
    });

    it("should reject when user ID is missing", async () => {
      const input = makeCreateListingInput();

      const context = {
        user: {
          userId: "",
          role: GlobalRole.CUSTOMER,
          tenantId: "tenant-kyoto",
        },
      };

      await expect(
        (resolvers as any).Mutation.createListing(
          null,
          { input },
          context,
        ),
      ).rejects.toThrow("User ID is required");

      expect(
        resolveAuthorizationIdentity,
      ).not.toHaveBeenCalled();

      expect(
        mockCreateListing.execute,
      ).not.toHaveBeenCalled();
    });

    // --------------------------------------------------------
    // HOST
    // --------------------------------------------------------

    it("should allow HOST to create listing in active tenant", async () => {
      mockIdentity({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.HOST,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-kyoto",
        ownerId: "forged-owner",
      });

      const context = makeContext({
        userId: "alice-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      const result =
        await (resolvers as any).Mutation.createListing(
          null,
          { input },
          context,
        );

      expect(
        resolveAuthorizationIdentity,
      ).toHaveBeenCalledWith({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        activeTenantId: "tenant-kyoto",
      });

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-kyoto",
          ownerId: "alice-user",
          categoryIds: [],
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: "created-listing",
        }),
      );
    });

    // --------------------------------------------------------
    // OWNER
    // --------------------------------------------------------

    it("should allow OWNER to create listing in active tenant", async () => {
      mockIdentity({
        userId: "yuki-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.OWNER,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-kyoto",
        ownerId: "another-user",
      });

      const context = makeContext({
        userId: "yuki-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-kyoto",
          ownerId: "yuki-user",
        }),
      );
    });

    // --------------------------------------------------------
    // STAFF
    // --------------------------------------------------------

    it("should reject STAFF from creating listing", async () => {
      mockIdentity({
        userId: "staff-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.STAFF,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-kyoto",
      });

      const context = makeContext({
        userId: "staff-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      await expect(
        (resolvers as any).Mutation.createListing(
          null,
          { input },
          context,
        ),
      ).rejects.toThrow(
         "Membership role cannot create listings",
      );

      expect(
        mockCreateListing.execute,
      ).not.toHaveBeenCalled();
    });

    // --------------------------------------------------------
    // AGENT
    // --------------------------------------------------------

it("should reject AGENT from creating listing", async () => {
  mockIdentity({
    userId: "agent-user",
    globalRole: GlobalRole.CUSTOMER,
    tenantId: "tenant-kyoto",
    membershipRole: MembershipRole.AGENT,
  });

  const input = makeCreateListingInput({
    tenantId: "tenant-kyoto",
  });

  const context = makeContext({
    userId: "agent-user",
    role: GlobalRole.CUSTOMER,
    tenantId: "tenant-kyoto",
  });

  await expect(
    (resolvers as any).Mutation.createListing(
      null,
      { input },
      context,
    ),
  ).rejects.toThrow(
    "Membership role cannot create listings",
  );

  expect(mockCreateListing.execute).not.toHaveBeenCalled();
});

    // --------------------------------------------------------
    // TENANT SCOPE
    // --------------------------------------------------------

    it("should ignore forged tenantId from HOST input and use active tenant", async () => {
      mockIdentity({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.HOST,
      });

      const input = makeCreateListingInput({
        // Client attempts to create in Tokyo.
        tenantId: "tenant-tokyo",
        ownerId: "another-user",
      });

      const context = makeContext({
        userId: "alice-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-kyoto",
          ownerId: "alice-user",
        }),
      );

      const enrichedInput =
        mockCreateListing.execute.mock.calls[0][0];

      expect(enrichedInput.tenantId).not.toBe(
        "tenant-tokyo",
      );

      expect(enrichedInput.ownerId).not.toBe(
        "another-user",
      );
    });

    it("should reject HOST when there is no active tenant", async () => {
      mockIdentity({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: null,
        membershipRole: null,
      });

      const input = makeCreateListingInput();

      const context = makeContext({
        userId: "alice-user",
        role: GlobalRole.CUSTOMER,
        tenantId: null,
      });

      await expect(
        (resolvers as any).Mutation.createListing(
          null,
          { input },
          context,
        ),
      ).rejects.toThrow("Active tenant is required");

      expect(
        mockCreateListing.execute,
      ).not.toHaveBeenCalled();
    });

    // --------------------------------------------------------
    // OWNER ID / OWNERSHIP
    // --------------------------------------------------------

    it("should force normal HOST ownerId to current user", async () => {
      mockIdentity({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.HOST,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-kyoto",
        ownerId: "another-user",
      });

      const context = makeContext({
        userId: "alice-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: "alice-user",
        }),
      );

      expect(
        mockCreateListing.execute.mock.calls[0][0].ownerId,
      ).not.toBe("another-user");
    });

    // --------------------------------------------------------
    // GLOBAL ADMIN
    // --------------------------------------------------------

    it("should allow ADMIN to create listing for target tenant", async () => {
      mockIdentity({
        userId: "admin-user",
        globalRole: GlobalRole.ADMIN,
        tenantId: null,
        membershipRole: null,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-tokyo",
        ownerId: "host-user",
      });

      const context = makeContext({
        userId: "admin-user",
        role: GlobalRole.ADMIN,
        tenantId: null,
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-tokyo",
          ownerId: "host-user",
        }),
      );
    });

    it("should allow SUPER_ADMIN to create listing for target tenant", async () => {
      mockIdentity({
        userId: "super-admin-user",
        globalRole: GlobalRole.SUPER_ADMIN,
        tenantId: null,
        membershipRole: null,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-tokyo",
        ownerId: "host-user",
      });

      const context = makeContext({
        userId: "super-admin-user",
        role: GlobalRole.SUPER_ADMIN,
        tenantId: null,
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        mockCreateListing.execute,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "tenant-tokyo",
          ownerId: "host-user",
        }),
      );
    });

    it("should reject ADMIN when target tenant is missing", async () => {
      mockIdentity({
        userId: "admin-user",
        globalRole: GlobalRole.ADMIN,
        tenantId: null,
        membershipRole: null,
      });

      const input = makeCreateListingInput({
        tenantId: null,
      });

      const context = makeContext({
        userId: "admin-user",
        role: GlobalRole.ADMIN,
        tenantId: null,
      });

      await expect(
        (resolvers as any).Mutation.createListing(
          null,
          { input },
          context,
        ),
      ).rejects.toThrow("Target tenant is required");

      expect(
        mockCreateListing.execute,
      ).not.toHaveBeenCalled();
    });

    // --------------------------------------------------------
    // Identity resolution
    // --------------------------------------------------------

    it("should resolve authorization identity from current user and active tenant", async () => {
      mockIdentity({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
        membershipRole: MembershipRole.HOST,
      });

      const input = makeCreateListingInput({
        tenantId: "tenant-tokyo",
      });

      const context = makeContext({
        userId: "alice-user",
        role: GlobalRole.CUSTOMER,
        tenantId: "tenant-kyoto",
      });

      await (resolvers as any).Mutation.createListing(
        null,
        { input },
        context,
      );

      expect(
        resolveAuthorizationIdentity,
      ).toHaveBeenCalledTimes(1);

      expect(
        resolveAuthorizationIdentity,
      ).toHaveBeenCalledWith({
        userId: "alice-user",
        globalRole: GlobalRole.CUSTOMER,
        activeTenantId: "tenant-kyoto",
      });
    });
  });
});