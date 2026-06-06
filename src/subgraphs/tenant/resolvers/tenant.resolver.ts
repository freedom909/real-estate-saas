import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { DependencyContainer } from 'tsyringe';



export const resolvers = {
  Query: {
    getHostTenant: async (_: any, { id }: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      return service.getHost(id);
    },
    getTenant: async (_: any, { id }: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      return service.getTenant(id);
    },
    getTenants: async (_: any, __: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      return service.getTenantsAll();
    
    },
  },
  Mutation: {
    createTenant: async (_: any, { input }: { input: { name: string; slug: string } }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      console.log(input)
      return service.createHost(input);
    },
  },
  Host: {
    __resolveReference: async (reference: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      return service.getHost(reference.id);
    },
  },
  User: {
    hosts: async (user: { id: string }, _: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<any>(TOKENS_TENANT.services.tenantService);
      return service.getHostsForUser(user.id);
    },
  },
};
