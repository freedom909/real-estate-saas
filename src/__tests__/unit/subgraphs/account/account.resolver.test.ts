import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock tokens
jest.mock("@/modules/tokens/account.token", () => ({
  TOKENS_ACCOUNT: {
    GetMyDashboardUseCase: Symbol.for("Account.GetMyDashboardUseCase"),
    ListingACL: Symbol.for("Account.ListingACL"),
    BookingACL: Symbol.for("Account.BookingACL"),
    ReviewACL: Symbol.for("Account.ReviewACL"),
    TenantACL: Symbol.for("Account.TenantACL"),
  },
}));

jest.mock("tsyringe", () => ({
  container: {
    resolve: jest.fn(),
  },
}));

import { resolvers } from "@/subgraphs/account/account.resolver";
import { container } from "tsyringe";

describe("Account Resolvers", () => {
  let mockDashboardUseCase: any;
  let mockListingACL: any;
  let mockBookingACL: any;
  let mockReviewACL: any;
  let mockTenantACL: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDashboardUseCase = { execute: jest.fn() };
    mockListingACL = { getListingsByOwner: jest.fn(), getContext: jest.fn() };
    mockBookingACL = { getBookingsByUser: jest.fn() };
    mockReviewACL = { getReviewsByUser: jest.fn() };
    mockTenantACL = { getTenantsByUser: jest.fn() };

    (container.resolve as jest.Mock).mockImplementation((token: symbol) => {
      if (token === Symbol.for("Account.GetMyDashboardUseCase")) return mockDashboardUseCase;
      if (token === Symbol.for("Account.ListingACL")) return mockListingACL;
      if (token === Symbol.for("Account.BookingACL")) return mockBookingACL;
      if (token === Symbol.for("Account.ReviewACL")) return mockReviewACL;
      if (token === Symbol.for("Account.TenantACL")) return mockTenantACL;
      return null;
    });
  });

  describe("Query.myDashboard", () => {
    it("should return dashboard for authenticated user", async () => {
      const mockDashboard = {
        bookings: [{ id: "b1" }],
        listings: [{ id: "l1" }],
        reviews: [],
      };
      mockDashboardUseCase.execute.mockResolvedValue(mockDashboard);

      const context = { user: { userId: "user-1" } };
      const result = await (resolvers as any).Query.myDashboard(null, {}, context);

      expect(mockDashboardUseCase.execute).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockDashboard);
    });

    it("should also accept context.user.id", async () => {
      mockDashboardUseCase.execute.mockResolvedValue({});

      const context = { user: { id: "user-2" } };
      await (resolvers as any).Query.myDashboard(null, {}, context);

      expect(mockDashboardUseCase.execute).toHaveBeenCalledWith("user-2");
    });

    it("should throw when unauthenticated", async () => {
      const context = {};
      await expect(
        (resolvers as any).Query.myDashboard(null, {}, context)
      ).rejects.toThrow("Unauthenticated");
    });
  });

  describe("Query.myListings", () => {
    it("should return listings for authenticated owner", async () => {
      const mockListings = [
        { id: "l1", title: "Tokyo Hotel", ownerId: "user-1" },
        { id: "l2", title: "Osaka Inn", ownerId: "user-1" },
      ];
      mockListingACL.getListingsByOwner.mockResolvedValue(mockListings);

      const context = { user: { userId: "user-1" } };
      const result = await (resolvers as any).Query.myListings(null, {}, context);

      expect(mockListingACL.getListingsByOwner).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockListings);
    });

    it("should also accept context.user.id", async () => {
      mockListingACL.getListingsByOwner.mockResolvedValue([]);

      const context = { user: { id: "user-3" } };
      await (resolvers as any).Query.myListings(null, {}, context);

      expect(mockListingACL.getListingsByOwner).toHaveBeenCalledWith("user-3");
    });

    it("should throw when unauthenticated", async () => {
      const context = {};
      await expect(
        (resolvers as any).Query.myListings(null, {}, context)
      ).rejects.toThrow("Unauthenticated");
    });

    it("should return empty array when owner has no listings", async () => {
      mockListingACL.getListingsByOwner.mockResolvedValue([]);

      const context = { user: { userId: "user-4" } };
      const result = await (resolvers as any).Query.myListings(null, {}, context);

      expect(result).toEqual([]);
    });
  });
});
