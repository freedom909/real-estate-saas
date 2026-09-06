import { container } from "tsyringe";
import { TOKENS_LOCATION } from "../../modules/tokens/location.tokens";
import { GetLocationsUseCase } from "@/core/location/application/usecases/getLocationsUseCase";

import { GetLocationUseCase } from "@/core/location/application/usecases/getLocationUseCase";
import { CreateLocationUseCase } from "@/core/location/application/usecases/createLocation.usecase";

export const resolvers = {
  Query: {
    getLocation: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase);
      return await useCase.execute(id);
    },
locations: async (
  _: any,
  { locationId }: { locationId?: string }
) => {
  const useCase = container.resolve<GetLocationsUseCase>(
    TOKENS_LOCATION.getLocationsUseCase
  );

  return await useCase.execute(locationId);
},
  },
  Mutation: {
    createLocation: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateLocationUseCase>(TOKENS_LOCATION.createLocationUseCase);
      return await useCase.execute(input);
    },
  },
  Location: {
    __resolveReference: (ref: any) =>
      container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase).execute(ref.id),
  },
};
