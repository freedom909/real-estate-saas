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
      getMembership: Symbol.for("getMembershipUseCase"),
getMemberships: Symbol.for("getMembershipsUseCase"),
getMyTenants: Symbol.for("getMyTenantsUseCase"),
getMyMembership: Symbol.for("getMyMembershipUseCase"),
createMembership: Symbol.for("createMembershipUseCase"),
updateMembership: Symbol.for("updateMembershipUseCase"),
removeMembership: Symbol.for("removeMembershipUseCase"),
    },
  },
}));

import { resolvers } from "@/subgraphs/tenant/resolvers/resolver";

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
      getMembership: { execute: jest.fn() },
      getMemberships: { execute: jest.fn() },
      getMyTenants: { execute: jest.fn() },
      getMyMembership: { execute: jest.fn() },
      createMembership: { execute: jest.fn() },
      updateMembership: { execute: jest.fn() },
      removeMembership: { execute: jest.fn() },
    };

    mockContainer = {
      resolve: jest.fn((token: symbol) => {
        const tokenKey = Object.entries({
          getTenant: Symbol.for("getTenantUseCase"),
          listTenants: Symbol.for("listTenantsUseCase"),
          createTenant: Symbol.for("createTenantUseCase"),
          updateTenant: Symbol.for("updateTenantUseCase"),
          suspendTenant: Symbol.for("suspendTenantUseCase"),
          getMembership: Symbol.for("getMembershipUseCase"),
getMemberships: Symbol.for("getMembershipsUseCase"),
getMyTenants: Symbol.for("getMyTenantsUseCase"),
getMyMembership: Symbol.for("getMyMembershipUseCase"),
createMembership: Symbol.for("createMembershipUseCase"),
updateMembership: Symbol.for("updateMembershipUseCase"),
removeMembership: Symbol.for("removeMembershipUseCase"),
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
    };

    const mockTenant = {
      id: "tenant-new",
      ...input,
      ownerUserId: "user-1",
      status: "ACTIVE",
    };

    mockUseCases.createTenant.execute.mockResolvedValue(mockTenant);

    const result = await (resolvers as any).Mutation.createTenant(
      null,
      { input },
      {
        user: { userId: "user-1" },
        container: mockContainer,
      }
    );

    expect(mockUseCases.createTenant.execute).toHaveBeenCalledWith({
      ...input,
      ownerUserId: "user-1",
    });

    expect(result).toEqual(mockTenant);
  });
});



describe("Mutation.updateTenant", () => {
  it("should update tenant name", async () => {
    const mockTenant = {
      id: "tenant-1",
      name: "Updated Tenant",
      slug: "updated-tenant",
      ownerUserId: "user-1",
      status: "ACTIVE",
    };

    mockUseCases.updateTenant.execute.mockResolvedValue(mockTenant);

    const result = await (resolvers as any).Mutation.updateTenant(
      null,
      {
        id: "tenant-1",
        input: {
          name: "Updated Tenant",
        },
      },
      {
        user: { userId: "user-1" },
        container: mockContainer,
      }
    );

    expect(mockUseCases.updateTenant.execute).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      name: "Updated Tenant",
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

describe("Membership Resolvers", () => {
  const userContext = {
    user: { userId: "user-1", role: "CUSTOMER" },
    container: {} as any,
  };

  beforeEach(() => {
    userContext.container = mockContainer;
  });

  describe("Query.getMembership", () => {
    it("should pass the actor and membership ID to the use case", async () => {
      const membership = {
        id: "membership-1",
        userId: "user-2",
        tenantId: "tenant-1",
        role: "HOST",
        status: "ACTIVE",
      };

      mockUseCases.getMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Query.getMembership(
        null,
        { id: "membership-1" },
        userContext
      );

      expect(mockUseCases.getMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        membershipId: "membership-1",
      });
      expect(result).toEqual(membership);
    });

    it("should reject an unauthenticated user", async () => {
      await expect(
        (resolvers as any).Query.getMembership(
          null,
          { id: "membership-1" },
          { user: null, container: mockContainer }
        )
      ).rejects.toThrow("Unauthenticated");

      expect(mockUseCases.getMembership.execute).not.toHaveBeenCalled();
    });

    it("should not treat a legacy OWNER role as platform admin", async () => {
      mockUseCases.getMembership.execute.mockResolvedValue(null);

      await (resolvers as any).Query.getMembership(
        null,
        { id: "membership-1" },
        {
          user: { userId: "user-1", role: "OWNER" },
          container: mockContainer,
        }
      );

      expect(mockUseCases.getMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        membershipId: "membership-1",
      });
    });
  });

  describe("Query.getMemberships", () => {
    it("should pass the actor and filters to the use case", async () => {
      const resultData = {
        items: [],
        pageInfo: { total: 0, hasNextPage: false },
      };
      mockUseCases.getMemberships.execute.mockResolvedValue(resultData);

      const filter = {
        tenantId: "tenant-1",
        role: "HOST",
        status: "ACTIVE",
        limit: 20,
        offset: 0,
      };

      const result = await (resolvers as any).Query.getMemberships(
        null,
        { filter },
        userContext
      );

      expect(mockUseCases.getMemberships.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        ...filter,
      });
      expect(result).toEqual(resultData);
    });
  });

  describe("Query.getMyTenants", () => {
    it("should query tenants for the authenticated user", async () => {
      const tenants = [{ id: "tenant-1", name: "Kyoto Stays" }];
      mockUseCases.getMyTenants.execute.mockResolvedValue(tenants);

      const result = await (resolvers as any).Query.getMyTenants(
        null,
        {},
        userContext
      );

      expect(mockUseCases.getMyTenants.execute).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(tenants);
    });
  });

  describe("Query.getMyMembership", () => {
    it("should query the current user's membership in a tenant", async () => {
      const membership = {
        id: "membership-1",
        userId: "user-1",
        tenantId: "tenant-1",
        role: "OWNER",
        status: "ACTIVE",
      };
      mockUseCases.getMyMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Query.getMyMembership(
        null,
        { tenantId: "tenant-1" },
        userContext
      );

      expect(mockUseCases.getMyMembership.execute).toHaveBeenCalledWith({
        userId: "user-1",
        tenantId: "tenant-1",
      });
      expect(result).toEqual(membership);
    });
  });

  describe("Mutation.createMembership", () => {
    it("should pass the actor and membership input to the use case", async () => {
      const input = {
        tenantId: "tenant-1",
        userId: "user-2",
        role: "HOST",
      };
      const membership = {
        id: "membership-1",
        ...input,
        status: "ACTIVE",
      };
      mockUseCases.createMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Mutation.createMembership(
        null,
        { input },
        userContext
      );

      expect(mockUseCases.createMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        status: "ACTIVE",
        ...input,
      });
      expect(result).toEqual(membership);
    });
  });

  describe("Mutation.updateMembership", () => {
    it("should pass the actor, membership ID and updates to the use case", async () => {
      const input = { role: "AGENT" };
      const membership = {
        id: "membership-1",
        userId: "user-2",
        tenantId: "tenant-1",
        role: "AGENT",
        status: "ACTIVE",
      };
      mockUseCases.updateMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Mutation.updateMembership(
        null,
        { id: "membership-1", input },
        userContext
      );

      expect(mockUseCases.updateMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        membershipId: "membership-1",
        ...input,
      });
      expect(result).toEqual(membership);
    });
  });

  describe("Mutation.removeMembership", () => {
    it("should pass the actor and membership ID to the use case", async () => {
      const membership = {
        id: "membership-1",
        userId: "user-2",
        tenantId: "tenant-1",
        role: "HOST",
        status: "REMOVED",
      };
      mockUseCases.removeMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Mutation.removeMembership(
        null,
        { id: "membership-1" },
        userContext
      );

      expect(mockUseCases.removeMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        membershipId: "membership-1",
      });
      expect(result).toEqual(membership);
    });
  });

  describe("Tenant.memberships", () => {
    it("should return membership items for the tenant", async () => {
      const items = [
        {
          id: "membership-1",
          userId: "user-2",
          tenantId: "tenant-1",
          role: "HOST",
          status: "ACTIVE",
        },
      ];

      mockUseCases.getMemberships.execute.mockResolvedValue({
        items,
        pageInfo: { total: 1, hasNextPage: false },
      });

      const result = await (resolvers as any).Tenant.memberships(
        { id: "tenant-1" },
        {},
        userContext
      );

      expect(mockUseCases.getMemberships.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        tenantId: "tenant-1",
      });
      expect(result).toEqual(items);
    });
  });

  describe("Membership reference fields", () => {
    it("should return a Tenant reference", () => {
      expect(
        (resolvers as any).Membership.tenant({
          id: "membership-1",
          tenantId: "tenant-1",
          userId: "user-2",
        })
      ).toEqual({
        __typename: "Tenant",
        id: "tenant-1",
      });
    });

    it("should return a User reference", () => {
      expect(
        (resolvers as any).Membership.user({
          id: "membership-1",
          tenantId: "tenant-1",
          userId: "user-2",
        })
      ).toEqual({
        __typename: "User",
        id: "user-2",
      });
    });

    it("should resolve a Membership reference through the use case", async () => {
      const membership = {
        id: "membership-1",
        userId: "user-2",
        tenantId: "tenant-1",
        role: "HOST",
        status: "ACTIVE",
      };
      mockUseCases.getMembership.execute.mockResolvedValue(membership);

      const result = await (resolvers as any).Membership.__resolveReference(
        { id: "membership-1" },
        userContext
      );

      expect(mockUseCases.getMembership.execute).toHaveBeenCalledWith({
        actor: {
          userId: "user-1",
          globalRole: "CUSTOMER",
        },
        membershipId: "membership-1",
      });
      expect(result).toEqual(membership);
    });
  });
});

});
