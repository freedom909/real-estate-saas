import { container } from "tsyringe";
import { TOKENS_LOCATION } from "../../modules/tokens/location.tokens";
import { GetLocationsUseCase } from "@/core/location/application/usecases/getLocationsUseCase";

import { GetLocationUseCase } from "@/core/location/application/usecases/getLocationUseCase";
import { CreateLocationUseCase } from "@/core/location/application/usecases/createLocation.usecase";

export const resolvers = {
  Query: {
    getLocation: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase);
      const location = await useCase.execute(id);
      return location;
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
      const location = await useCase.execute(input);
            return {
        code: 200,
        success: true,
        message: "Location created successfully",
        location,
      };
    },
  },
  Location: {
    __resolveReference: (ref: any) =>
      container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase).execute(ref.id),
  },
};
