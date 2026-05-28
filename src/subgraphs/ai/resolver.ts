//
// ai/resolver.ts
import { container } from "tsyringe";
import AIService  from "./services/ai.service";

export const resolvers = {
  Mutation: {
    chat: async (_: any, { input }: any) => {
      const service = container.resolve(AIService);
      return service.chat(input);
    },
  },
};