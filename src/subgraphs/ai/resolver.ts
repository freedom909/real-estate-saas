//
// ai/resolver.ts
import { container } from "tsyringe";
import { AgentRouterService } from "./application/orchestration/AgentRouterService";
import GraphQLJSON from "graphql-type-json";


export const resolvers = {
  JSON: GraphQLJSON, //
  Query: {
    _aiHealth: () => true,
  },
  
  Mutation: {
    // 调用 AgentRouterService 进行路由处理
    chat: async (_: any, { input }: any) => {
      const router = container.resolve(AgentRouterService);
      return router.execute(input);
    },
  },
};