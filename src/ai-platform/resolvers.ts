//
import { container } from "tsyringe";
import { ChatUseCase } from "./application/use-cases/chat.use-case";

export const resolvers = {
  Mutation: {
    chat: async (
      _: unknown,
      { input }: any,
      context:any
    ) => {
      const useCase = container.resolve(ChatUseCase);
      console.log("context.user",context.user);// this must have the gateway,otherwise,no user can be found
      return useCase.execute(input.message,context.user);
    }
  }
};