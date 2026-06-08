import { container } from "tsyringe";

import { AIRequestFactory } from "./aiRequest.factory";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import { ChatUseCase } from "../application/usecases/chatUseCase";

export const resolvers = {
  Mutation: {
    chat: async (_, { input }, context) => {
      const request =AIRequestFactory.fromGraphQL(input, context);
      return container.resolve<ChatUseCase>( TOKENS_AI.chatUseCase).execute(request);// 
      //名前 'ChatUseCase' が見つかりません。プロパティ 'execute' は型 'unknown' に存在しません。
    },

  }
};