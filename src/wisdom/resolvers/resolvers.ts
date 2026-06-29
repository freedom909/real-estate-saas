import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { WISDOM_TOKENS } from "@/wisdom/container/tokens/wisdom.tokens";
import { ChatUseCase } from "@/wisdom/application/usecases/chat.use-case";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      console.log("GRAPHQL CONTEXT", Object.keys(context));
      const factory=container.resolve(AIRequestFactory);
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
      const result = await chatUseCase.execute(aiRequest);  
      return result;
    },
  }
};
