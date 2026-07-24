
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { DependencyContainer } from 'tsyringe';
import { SessionService } from '@/subgraphs/auth/infrastructure/services/session.service';

type TenantParent = {

  id: string;

  ownerUserId: string;

};

export const resolvers = {

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

  Mutation: {

    createTenant: async (

      _: unknown,

      { input }: any,

      { container }: { container: DependencyContainer }

    ) => {

      const useCase = container.resolve<any>(

        TOKENS_TENANT.useCases.createTenant

      );

      return useCase.execute(input);

    },

    updateTenant: async (

      _: unknown,

      { id, name }: any,

      { container }: { container: DependencyContainer }

    ) => {

      const useCase = container.resolve<any>(

        TOKENS_TENANT.useCases.updateTenant

      );

      return useCase.execute({ tenantId: id, name });

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

      { user, container }: { user: any; container: DependencyContainer }

    ) => {

      if (!user?.userId) {
        throw new Error("Unauthenticated");
      }

      const useCase = container.resolve<any>(

        TOKENS_TENANT.useCases.switchTenant

      );

      const result = await useCase.execute({ userId: user.userId, tenantId });

      // Update the session with the new active tenant
      if (user?.sessionId) {
        const sessionService = new SessionService();
        await sessionService.updateActiveTenant(user.sessionId, tenantId);
      }

      return result;

    },

  },

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

      if (!parent.ownerUserId) return null;

      return {

        __typename: "User",

        id: parent.ownerUserId,

      };

    },

  },

};
