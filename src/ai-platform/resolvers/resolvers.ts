import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ChatUseCase } from "../application/usecases/chatUseCase";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      const request = AIRequestFactory.fromGraphQL(input, context);
      const result = await container.resolve<ChatUseCase>(TOKENS_AI.usecase.chatUseCase).execute(request)
      console.log(
        "FINAL RESULT",
        JSON.stringify(result, null, 2)
      );
      return result;

    },

  }
};