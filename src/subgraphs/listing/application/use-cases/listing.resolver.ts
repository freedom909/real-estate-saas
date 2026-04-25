import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';
import CreateListingUseCase from './CreateListingUseCase';


export const resolvers = {
  Query: {
    getListing: async (_: any, { id }: { id: string }) => {
      const repo = container.resolve<IListingRepository>(TOKENS_LISTING.ListingRepository);
      return repo.findById(id);
    },
  },
  Mutation: {
    createListing: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateListingUseCase>(TOKENS_LISTING.CreateListingUseCase);
      return useCase.execute(input);
    },
  },
};