import { container } from 'tsyringe';

import { TOKENS_AMENITY } from '@/modules/tokens/amenity.tokens';
import { AmenityRepository } from './infrastructure/persistence/amenity.repository';
import { GetAmenitiesUseCase } from './application/useCase/GetAmenitiesUseCase';
import { GetAmenitiesByIdsUseCase } from './application/useCase/GetAmenitiesByIdsUseCase';
import { CreateAmenityUseCase } from './application/useCase/CreateAmenityUseCase';

const resolvers = {
  Query: {
    amenities: async () => {
      const usecase = container.resolve(GetAmenitiesUseCase);
      return usecase.execute();
    },

    amenity: async (_: any, { id }: any) => {
      const usecase = container.resolve(GetAmenitiesUseCase);
      return usecase.execute();
    },

    amenitiesByIds: async (_: any, { ids }: any) => {
      const usecase = container.resolve(GetAmenitiesByIdsUseCase);
      return usecase.execute(ids);
    },
  },

  Mutation: {
    createAmenity: async (_: any, { input }: any) => {
      const usecase = container.resolve(CreateAmenityUseCase);
      return usecase.execute(input);
    },
  },
};

export default resolvers;