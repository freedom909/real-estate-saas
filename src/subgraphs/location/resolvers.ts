import { container } from "tsyringe";
import { TOKENS_LOCATION } from "../../modules/tokens/location.tokens";
import { CreateLocationUseCase } from "./application/use-cases/createLocationUseCase";
import { GetLocationUseCase } from "./application/use-cases/getLocationUseCase";
import { ApplyDescriptionSuggestionUseCase } from "../listing/domain/entities/applyDescriptionSuggestionUseCase";


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

  
    applyDescriptionSuggestion: async (_: any, { listingId }: { listingId: string }) => {
      const useCase = container.resolve(ApplyDescriptionSuggestionUseCase);
      return await useCase.execute(listingId);
    },
  },
  Location: { __resolveReference: (ref: any) => container.resolve<GetLocationUseCase>(TOKENS_LOCATION.getLocationUseCase).execute(ref.id) }
};
