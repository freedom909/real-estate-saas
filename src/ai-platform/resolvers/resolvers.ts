import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ChatUseCase } from "../application/usecases/chatUseCase";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      const request = AIRequestFactory.fromGraphQL(input, context);
      console.log("📥 Chat request received, message:", request.message);

      let chatUseCase: ChatUseCase;
      try {
        chatUseCase = container.resolve<ChatUseCase>(TOKENS_AI.usecase.chatUseCase);
        console.log("✅ ChatUseCase resolved");
      } catch (err) {
        console.error("❌ Failed to resolve ChatUseCase:", err);
        throw err;
      }

      const result = await chatUseCase.execute(request)
      console.log(
        "FINAL RESULT",
        JSON.stringify(result, null, 2)
      );
      return result;

    },

  }
};
