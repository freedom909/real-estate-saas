
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { DependencyContainer } from 'tsyringe';

export const resolvers = {
  Query: {
    getTenant: async (_: any, { id }: { id: string }, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.getTenant);
      return useCase.execute(id);
    },
    getTenants: async (_: any, { filter }: any, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.listTenants);
      return useCase.execute(filter || {});
    },
  },
  Mutation: {
    createTenant: async (_: any, { input }: any, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.createTenant);
      return useCase.execute(input);
    },
    updateTenant: async (_: any, { id, name }: any, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.updateTenant);
      return useCase.execute({ tenantId: id, name });
    },
    suspendTenant: async (_: any, { id }: any, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.suspendTenant);
      return useCase.execute(id);
    },
  },
  Tenant: {
    __resolveReference: async (reference: { id: string }, { container }: { container: DependencyContainer }) => {
      const useCase = container.resolve<any>(TOKENS_TENANT.useCases.getTenant);
      return useCase.execute(reference.id);
    },
  },
};
