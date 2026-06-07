import { container } from "tsyringe";
import { ChatUseCase } from "../application/use-cases/chat.use-case";
import { AIRequestFactory } from "./aiRequestFactory";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      const request =
        AIRequestFactory.fromGraphQL(input, context);

      return container
        .resolve(ChatUseCase)
        .execute(request);
    },

  }
};