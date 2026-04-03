import { container } from 'tsyringe';
import { ListingService } from '../services/Listing.service';

export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const service = container.resolve(ListingService);
      return service.getListing(id);
    },
  },
  Mutation: {
    createListing: async (_: any, { input }: { input: { tenantId: string; name: string; address: string } }) => {
      const service = container.resolve(ListingService);
      return service.createListing(input);
    },
  },
  Listing: {
    tenant: (parent: any) => {
      return { __typename: 'Tenant', id: parent.tenantId };
    },
    __resolveReference: async (ref: { id: string }) => {
      const service = container.resolve(ListingService);
      return service.getListing(ref.id);
    },
  },
  Tenant: {
    properties: async (parent: { id: string }) => {
      // Parent is the Tenant entity stub from federation
      const service = container.resolve(ListingService);
      return service.getPropertiesByTenant(parent.id);
    }
  }
};