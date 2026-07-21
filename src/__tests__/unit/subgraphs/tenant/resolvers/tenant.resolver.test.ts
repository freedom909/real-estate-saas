import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies
jest.mock("@/modules/tokens/tenant.tokens", () => ({
  TOKENS_TENANT: {
    useCases: {
      getTenant: Symbol.for("getTenantUseCase"),
      listTenants: Symbol.for("listTenantsUseCase"),
      createTenant: Symbol.for("createTenantUseCase"),
      updateTenant: Symbol.for("updateTenantUseCase"),
      suspendTenant: Symbol.for("suspendTenantUseCase"),
    },
  },
}));

import { resolvers } from "@/subgraphs/tenant/resolvers/tenant.resolver";

describe("Tenant Resolvers", () => {
  let mockContainer: any;
  let mockUseCases: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseCases = {
      getTenant: { execute: jest.fn() },
      listTenants: { execute: jest.fn() },
      createTenant: { execute: jest.fn() },
      updateTenant: { execute: jest.fn() },
      suspendTenant: { execute: jest.fn() },
    };

    mockContainer = {
      resolve: jest.fn((token: symbol) => {
        const tokenKey = Object.entries({
          getTenant: Symbol.for("getTenantUseCase"),
          listTenants: Symbol.for("listTenantsUseCase"),
          createTenant: Symbol.for("createTenantUseCase"),
          updateTenant: Symbol.for("updateTenantUseCase"),
          suspendTenant: Symbol.for("suspendTenantUseCase"),
        }).find(([_, t]) => t === token);

        if (tokenKey) return mockUseCases[tokenKey[0]];
        return null;
      }),
    };
  });

  describe("Query.getTenant", () => {
    it("should return a tenant by ID", async () => {
      const mockTenant = {
        id: "tenant-1",
        name: "Tokyo Hotels",
        slug: "tokyo-hotels",
        status: "ACTIVE",
        ownerUserId: "user-1",
      };

      mockUseCases.getTenant.execute.mockResolvedValue(mockTenant);

      const result = await (resolvers as any).Query.getTenant(
        null,
        { id: "tenant-1" },
        { container: mockContainer }
      );

      expect(mockUseCases.getTenant.execute).toHaveBeenCalledWith("tenant-1");
      expect(result).toEqual(mockTenant);
    });

    it("should return null when tenant not found", async () => {
      mockUseCases.getTenant.execute.mockResolvedValue(null);

      const result = await (resolvers as any).Query.getTenant(
        null,
        { id: "missing" },
        { container: mockContainer }
      );

      expect(result).toBeNull();
    });
  });

  describe("Query.getTenants", () => {
    it("should return list of tenants", async () => {
      const mockTenants = {
        items: [
          { id: "tenant-1", name: "Tokyo Hotels" },
          { id: "tenant-2", name: "Osaka Hotels" },
        ],
        pageInfo: { total: 2, hasNextPage: false },
      };

      mockUseCases.listTenants.execute.mockResolvedValue(mockTenants);

      const result = await (resolvers as any).Query.getTenants(
        null,
        { filter: { status: "ACTIVE" } },
        { container: mockContainer }
      );

      expect(mockUseCases.listTenants.execute).toHaveBeenCalledWith({ status: "ACTIVE" });
      expect(result).toEqual(mockTenants);
    });

    it("should use empty filter when none provided", async () => {
      const mockTenants = { items: [], pageInfo: { total: 0, hasNextPage: false } };
      mockUseCases.listTenants.execute.mockResolvedValue(mockTenants);

      await (resolvers as any).Query.getTenants(
        null,
        {},
        { container: mockContainer }
      );

      expect(mockUseCases.listTenants.execute).toHaveBeenCalledWith({});
    });
  });

  describe("Mutation.createTenant", () => {
    it("should create a new tenant", async () => {
      const input = {
        name: "New Hotel Group",
        slug: "new-hotel-group",
        ownerUserId: "user-1",
      };

      const mockTenant = { id: "tenant-new", ...input, status: "ACTIVE" };
      mockUseCases.createTenant.execute.mockResolvedValue(mockTenant);

      const result = await (resolvers as any).Mutation.createTenant(
        null,
        { input },
        { container: mockContainer }
      );

      expect(mockUseCases.createTenant.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockTenant);
    });
  });

  describe("Mutation.updateTenant", () => {
    it("should update tenant name", async () => {
      const mockTenant = { id: "tenant-1", name: "Updated Name" };
      mockUseCases.updateTenant.execute.mockResolvedValue(mockTenant);

      const result = await (resolvers as any).Mutation.updateTenant(
        null,
        { id: "tenant-1", name: "Updated Name" },
        { container: mockContainer }
      );

      expect(mockUseCases.updateTenant.execute).toHaveBeenCalledWith({
        tenantId: "tenant-1",
        name: "Updated Name",
      });
      expect(result).toEqual(mockTenant);
    });
  });

  describe("Mutation.suspendTenant", () => {
    it("should suspend a tenant", async () => {
      const mockTenant = { id: "tenant-1", status: "SUSPENDED" };
      mockUseCases.suspendTenant.execute.mockResolvedValue(mockTenant);

      const result = await (resolvers as any).Mutation.suspendTenant(
        null,
        { id: "tenant-1" },
        { container: mockContainer }
      );

      expect(mockUseCases.suspendTenant.execute).toHaveBeenCalledWith("tenant-1");
      expect(result).toEqual(mockTenant);
    });
  });

  describe("Tenant.__resolveReference", () => {
    it("should resolve tenant reference by ID", async () => {
      const mockTenant = { id: "tenant-1", name: "Tokyo Hotels" };
      mockUseCases.getTenant.execute.mockResolvedValue(mockTenant);

      const result = await (resolvers as any).Tenant.__resolveReference(
        { id: "tenant-1" },
        { container: mockContainer }
      );

      expect(mockUseCases.getTenant.execute).toHaveBeenCalledWith("tenant-1");
      expect(result).toEqual(mockTenant);
    });
  });

  describe("Tenant.owner", () => {
    it("should return User reference with ownerUserId", () => {
      const parent = { id: "tenant-1", ownerUserId: "user-1" };

      const result = (resolvers as any).Tenant.owner(parent);

      expect(result).toEqual({
        __typename: "User",
        id: "user-1",
      });
    });

    it("should return null when ownerUserId is missing", () => {
      const parent = { id: "tenant-1", ownerUserId: "" };

      const result = (resolvers as any).Tenant.owner(parent);

      expect(result).toBeNull();
    });

    it("should return null when ownerUserId is undefined", () => {
      const parent = { id: "tenant-1" };

      const result = (resolvers as any).Tenant.owner(parent);

      expect(result).toBeNull();
    });
  });
});
