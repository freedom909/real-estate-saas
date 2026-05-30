import { container } from "tsyringe";
import { TOKENS_LOCATION } from "../../modules/tokens/ai/location.tokens";
import { CreateLocationUseCase } from "./application/use-cases/CreateLocationUseCase";
import { GetLocationUseCase } from "./application/use-cases/GetLocationUseCase";


export const resolvers = {
  Query: {
    getLocation: async (_: any, { id }: { id: string }) => {
      const useCase = container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase);
      return await useCase.execute(id);
    },
    // getLocations: async () => {
    //   const useCase = container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase);
    //   return await useCase.execute();//is it wrong because location is only one?
    // },
  },
  Mutation: {
    createLocation: async (_: any, { input }: any) => {
      const useCase = container.resolve<CreateLocationUseCase>(TOKENS_LOCATION.createLocationUseCase);
      return await useCase.execute(input);
    },
  },
  Location: { __resolveReference: (ref: any) => container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase).execute(ref.id) }
};
