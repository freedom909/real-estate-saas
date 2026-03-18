import { DependencyContainer } from 'tsyringe';
import { TenantService } from '../services/tenant.service';
import { TOKENS } from '../constants/tokens';

export const resolvers = {
  Query: {
    getTenant: async (_: any, { id }: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<TenantService>(TOKENS.TenantService);
      return service.getTenant(id);
    },
    getTenants: async (_: any, __: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<TenantService>(TOKENS.TenantService);
      return service.getTenantsAll();
    
    },
  },
  Mutation: {
    createTenant: async (_: any, { input }: { input: { name: string; slug: string } }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<TenantService>(TOKENS.TenantService);
      console.log(input)
      return service.createTenant(input);
    },
  },
  Tenant: {
    __resolveReference: async (reference: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<TenantService>(TOKENS.TenantService);
      return service.getTenant(reference.id);
    },
  },
  User: {
    tenants: async (user: { id: string }, _: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<TenantService>(TOKENS.TenantService);
      return service.getTenantsForUser(user.id);
    },
  },
};
