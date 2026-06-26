import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { ChatUseCase } from "@/wisdom/application/usecases/chat.use-case";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      console.log(
  "GRAPHQL CONTEXT",
  Object.keys(context)
);
      const request = AIRequestFactory.fromGraphQL(input, context);

      const chatUseCase = container.resolve<ChatUseCase>(WISDOM_TOKENS.chatUseCase);
      const result = await chatUseCase.execute(request);
      return result;
    },

  }
};
