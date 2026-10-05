
// src/subgraphs/tenant/resolvers/resolver.ts

import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { DependencyContainer } from "tsyringe";


type TenantParent = {
  id: string;
  ownerUserId: string;
};

export const resolvers = {
  // =========================================================
  // Query
  // =========================================================

  Query: {
    getTenant: async (
      _: unknown,
      { id }: { id: string },
      { container }: { container: DependencyContainer }
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getTenant
      );

      return useCase.execute(id);
    },

    getTenants: async (
      _: unknown,
      { filter }: any,
      { container }: { container: DependencyContainer }
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.listTenants
      );

      return useCase.execute(filter || {});
    },
  },

  // =========================================================
  // Mutation
  // =========================================================

  Mutation: {
    
createTenant: async (
  _: unknown,
  { input }: { input: { name: string; slug: string } },
  {
    user,
    container,
  }: {
    user: { userId: string } | null;
    container: DependencyContainer;
  }
) => {
  if (!user?.userId) {
    throw new Error("Unauthenticated");
  }

  const useCase = container.resolve<any>(
    TOKENS_TENANT.useCases.createTenant
  );

  return useCase.execute({
    ...input,
    ownerUserId: user.userId,
  });
},

    updateTenant: async (
      _: unknown,
      { id, input }: any,
      { container }: { container: DependencyContainer }
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.updateTenant
      );

      return useCase.execute({
        tenantId: id,
        name: input.name,
      });
    },

    suspendTenant: async (
      _: unknown,
      { id }: { id: string },
      { container }: { container: DependencyContainer }
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.suspendTenant
      );

      return useCase.execute(id);
    },

    switchTenant: async (
      _: unknown,
      { tenantId }: { tenantId: string },
      {
        user,
        container,
      }: {
        user: any;
        container: DependencyContainer;
      }
    ) => {
      if (!user?.userId) {
        throw new Error("Unauthenticated");
      }

      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.switchTenant

      );

      const result = await useCase.execute({
        userId: user.userId,
        tenantId,
        sessionId: user.sessionId,
      });

      return result;
    },
  },

  // =========================================================
  // Tenant Federation
  // =========================================================

  Tenant: {
    __resolveReference: async (
      reference: { id: string },
      { container }: { container: DependencyContainer }
    ) => {
      const useCase = container.resolve<any>(
        TOKENS_TENANT.useCases.getTenant
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
  },
};

