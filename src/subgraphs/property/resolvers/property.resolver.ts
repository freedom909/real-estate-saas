import { container } from 'tsyringe';
import { PropertyService } from '../services/property.service';

export const resolvers = {
  Query: {
    getProperty: async (_: any, { id }: { id: string }) => {
      const service = container.resolve(PropertyService);
      return service.getProperty(id);
    },
  },
  Mutation: {
    createProperty: async (_: any, { input }: { input: { tenantId: string; name: string; address: string } }) => {
      const service = container.resolve(PropertyService);
      return service.createProperty(input);
    },
  },
  Property: {
    tenant: (parent: any) => {
      return { __typename: 'Tenant', id: parent.tenantId };
    },
    __resolveReference: async (ref: { id: string }) => {
      const service = container.resolve(PropertyService);
      return service.getProperty(ref.id);
    },
  },
  Tenant: {
    properties: async (parent: { id: string }) => {
      // Parent is the Tenant entity stub from federation
      const service = container.resolve(PropertyService);
      return service.getPropertiesByTenant(parent.id);
    }
  }
};