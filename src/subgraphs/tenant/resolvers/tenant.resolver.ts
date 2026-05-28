import { DependencyContainer } from 'tsyringe';
import { HostService } from '../services/host.service';
import { TOKENS_Host } from '@/modules/tokens/host.tokens';


export const resolvers = {
  Query: {
    getHost: async (_: any, { id }: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<HostService>(TOKENS_Host.services.hostService);
      return service.getHost(id);
    },
    getHosts: async (_: any, __: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<HostService>(TOKENS_Host.services.hostService);
      return service.getHostsAll();
    
    },
  },
  Mutation: {
    createHost: async (_: any, { input }: { input: { name: string; slug: string } }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<HostService>(TOKENS_Host.services.hostService);
      console.log(input)
      return service.createHost(input);
    },
  },
  Host: {
    __resolveReference: async (reference: { id: string }, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<HostService>(TOKENS_Host.services.hostService);
      return service.getHost(reference.id);
    },
  },
  User: {
    hosts: async (user: { id: string }, _: any, { container }: { container: DependencyContainer }) => {
      const service = container.resolve<HostService>(TOKENS_Host.services.hostService);
      return service.getHostsForUser(user.id);
    },
  },
};
