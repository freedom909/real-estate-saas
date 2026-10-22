
// src/subgraphs/tenant/resolvers/resolver.ts


import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { DependencyContainer } from "tsyringe";
import { GlobalRole } from "@/core/shared/domain/role";
import { TenantStatus } from "@/core/tenant/domain/entities/tenant.entity";

type ResolverUser = {
  userId?: string;
  sessionId?: string;
  role?: string;
} | null;

type ResolverContext = {
  user?: ResolverUser;
  container: DependencyContainer;
};

type TenantParent = {
  id: string;
  ownerUserId?: string;
};

type MembershipParent = {
  id: string;
  userId: string;
  tenantId: string;
};

// Only explicit platform roles from the authenticated context may
// receive platform-wide privileges. OWNER/HOST are not global roles.
function toGlobalRole(role?: string): GlobalRole {
  const normalized = typeof role === "string" ? role.trim().toUpperCase() : "";

  if (normalized === "SUPER_ADMIN") {
    return GlobalRole.SUPER_ADMIN;
  }

  if (normalized === "ADMIN") {
    return GlobalRole.ADMIN;
  }

  return GlobalRole.CUSTOMER;
}

function requireActor(user: ResolverUser) {
  if (!user?.userId) {
    throw new Error("Unauthenticated");
  }

  return {
    userId: user.userId,
    globalRole: toGlobalRole(user.role),
  };
}

export const resolvers = {
  Query: {
    getTenant: async (
      _: unknown,
      { id }: { id: string },
      { container }: ResolverContext,
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getTenant,
      );

      return useCase.execute(id);
    },

    getTenants: async (
      _: unknown,
      { filter }: { filter?: Record<string, unknown> },
      { container }: ResolverContext,
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.listTenants,
      );

      return useCase.execute(filter || {});
    },

    getMembership: async (
      _: unknown,
      { id }: { id: string },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMembership,
      );

      return useCase.execute({ actor, membershipId: id });
    },

    getMemberships: async (
      _: unknown,
      { filter }: {
        filter: {
          tenantId: string;
          userId?: string;
          role?: string;
          status?: string;
          limit?: number;
          offset?: number;
        };
      },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMemberships,
      );

      return useCase.execute({ actor, ...filter });
    },

    getMyTenants: async (
      _: unknown,
      __: unknown,
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMyTenants,
      );

      return useCase.execute(actor.userId);
    },

    getMyMembership: async (
      _: unknown,
      { tenantId }: { tenantId: string },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMyMembership,
      );

      return useCase.execute({
        userId: actor.userId,
        tenantId,
      });
    },
  },

  Mutation: {
    createTenant: async (
      _: unknown,
      { input }: { input: { name: string; slug: string } },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.createTenant,
      );

      return useCase.execute({
        ...input,
        ownerUserId: actor.userId,
      });
    },

    updateTenant: async (
      _: unknown,
      { id, input }: { id: string; input: { name: string } },
      { container }: ResolverContext,
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.updateTenant,
      );

      return useCase.execute({
        tenantId: id,
        name: input.name,
      });
    },

    suspendTenant: async (
      _: unknown,
      { id }: { id: string },
      { container }: ResolverContext,
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.suspendTenant,
      );

      return useCase.execute(id);
    },

    switchTenant: async (
      _: unknown,
      { tenantId }: { tenantId: string },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.switchTenant,
      );

      return useCase.execute({
        userId: actor.userId,
        tenantId,
        sessionId: user?.sessionId,
      });
    },

    createMembership: async (
      _: unknown,
      { input }: {
        input: {
          tenantId: string;
          userId: string;
          role: string;
        };
      },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.createMembership,
      );

      return useCase.execute({
        actor,
        // Required by the existing use-case input; creation itself
        // always creates a Membership with ACTIVE status.
        status: TenantStatus.ACTIVE,
        ...input,
      });
    },

    updateMembership: async (
      _: unknown,
      { id, input }: {
        id: string;
        input: { role?: string; status?: string };
      },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.updateMembership,
      );

      return useCase.execute({
        actor,
        membershipId: id,
        ...input,
      });
    },

    removeMembership: async (
      _: unknown,
      { id }: { id: string },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.removeMembership,
      );

      return useCase.execute({
        actor,
        membershipId: id,
      });
    },
  },

  Tenant: {
    __resolveReference: async (
      reference: { id: string },
      { container }: ResolverContext,
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getTenant,
      );

      return useCase.execute(reference.id);
    },

    owner: (parent: TenantParent) => {
      if (!parent.ownerUserId) {
        return null;
      }

      return {
        __typename: "User",
        id: parent.ownerUserId,
      };
    },

    memberships: async (
      parent: TenantParent,
      _: unknown,
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMemberships,
      );

      const result = await useCase.execute({
        actor,
        tenantId: parent.id,
      });

      return result.items;
    },
  },

  Membership: {
    __resolveReference: async (
      reference: { id: string },
      { user, container }: ResolverContext,
    ) => {
      const actor = requireActor(user);
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getMembership,
      );

      return useCase.execute({
        actor,
        membershipId: reference.id,
      });
    },

    tenant: (parent: MembershipParent) => ({
      __typename: "Tenant",
      id: parent.tenantId,
    }),

    user: (parent: MembershipParent) => ({
      __typename: "User",
      id: parent.userId,
    }),
  },
};
