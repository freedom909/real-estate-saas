import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { ChatUseCase } from "@/wisdom/application/usecases/chat.use-case";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      console.log("GRAPHQL CONTEXT", Object.keys(context));

      try {
        const factory = container.resolve(AIRequestFactory);
        const aiRequest = factory.create(
          "web",
          {
            message: input.message,

            identity: {
              user: context.user,
              tenant: context.tenant,
            },

            runtime: {
              locale: context.locale,
              timezone: context.timezone,
              session: {
                id: context.user?.sessionId,
              },
            },

            resources: {
              listingId: input.listingId,
              bookingId: input.bookingId,
              reviewId: input.reviewId,
            },
          }
        );

        const chatUseCase = container.resolve<ChatUseCase>(WISDOM_TOKENS.chatUseCase);
        console.log("chatUseCase", chatUseCase);
        const result = await chatUseCase.execute(aiRequest);
        return result;
      } catch (error) {
        console.error("❌ CHAT RESOLVER ERROR:", error);

        // Return a valid ChatResponse instead of null
        // (prevents "Cannot return null for non-nullable field Mutation.chat")
        return {
          success: false,
          summary: "An error occurred while processing your request. Please try again.",
          artifacts: [],
        };
      }
    },
  }
};
