import { container } from 'tsyringe';

import { GetAmenitiesUseCase } from '@/core/amenity/application/useCase/getAmenitiesUseCase';
import { GetAmenitiesByIdsUseCase } from '@/core/amenity/application/useCase/getAmenitiesByIdsUseCase';
import { CreateAmenityUseCase } from '@/core/amenity/application/useCase/createAmenityUseCase';




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