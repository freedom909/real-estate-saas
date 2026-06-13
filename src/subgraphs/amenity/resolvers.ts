import { container } from 'tsyringe';

import { TOKENS_AMENITY } from '@/modules/tokens/amenity.tokens';

import { GetAmenitiesByIdsUseCase } from '@/core/amenity/application/useCase/GetAmenitiesByIdsUseCase';
import { CreateAmenityUseCase } from '@/core/amenity/application/useCase/CreateAmenityUseCase';
import { GetAmenitiesUseCase } from '@/core/amenity/application/useCase/GetAmenitiesUseCase';


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