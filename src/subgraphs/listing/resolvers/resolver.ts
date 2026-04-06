import { container } from 'tsyringe';

import CreateListingUseCase from '../application/use-cases/createListingUseCase';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import GetListingUseCase from '../application/use-cases/getListingUseCase';

export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(TOKENS_LISTING.GetListingUseCase);
      return useCase.execute(id);
    },

    listing: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(TOKENS_LISTING.GetListingUseCase);
      return useCase.execute(id);
    },
  },
 
  Mutation: {
    createListing: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateListingUseCase>(TOKENS_LISTING.CreateListingUseCase);
      return useCase.execute(input);
    },

  },
  Listing: {
    tenant: (parent: any) => {
      return { __typename: 'Tenant', id: parent.tenantId };
    },
    __resolveReference: async (ref: { id: string }) => {
      const useCase = container.resolve<GetListingUseCase>(TOKENS_LISTING.GetListingUseCase);
      return useCase.execute(ref.id);
    },
  },
  Tenant: {
    properties: async (parent: { id: string }) => {
      // Parent is the Tenant entity stub from federation
      const useCase = container.resolve<GetListingUseCase>(TOKENS_LISTING.GetListingUseCase);
      return useCase.execute(parent.id);
    }
  }
};