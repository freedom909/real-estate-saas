import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';

import CreateListingUseCase from '../../../core/listing/application/usecase/createListingUseCase';
import { IListingRepository } from '@/core/listing/domain/entities/IListingRepository';


export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const repo = container.resolve<IListingRepository>(TOKENS_LISTING.repos.listingRepository);
      return repo.findById(id);
    },
  },
  Mutation: {
    createListing: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateListingUseCase>(TOKENS_LISTING.usecase.createListingUseCase);
      return useCase.execute(input);
    },
  },
};