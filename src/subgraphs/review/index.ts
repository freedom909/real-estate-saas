import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import express from "express";
import http from "http";
import { expressMiddleware } from "@as-integrations/express4"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import type { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { reviewResolvers as resolvers} from "./review.resolver";
import { initMongoContainer } from "@/infrastructure/container/initMongoContainer";

import { container } from "tsyringe";
import getUserFromToken from "@/infrastructure/auth/getUserFromToken";

import TOKENS from "@/modules/tokens/mq.tokens";
import registerMQEventBus from "@/modules/container/mq.register";
import { registerReviewDependencies } from "@/modules/container/review.register";


dotenv.config();
registerMQEventBus();
const eventBus = container.resolve<ReviewMQEventBus>(TOKENS.eventBus);
await eventBus.init();

const typeDefs = gql(
  readFileSync("./src/subgraphs/review/schema.graphql", { encoding: "utf-8" })
);

const startApolloServer = async () => {
  try {
    // ✅ 初始化 DI（全局 container）
    console.log("⏳ Initializing containers...");
    await registerReviewDependencies();
    await initMysqlContainer();
    await initMongoContainer();
    console.log("✅ Containers initialized");

    const app = express();
    const httpServer = http.createServer(app);

    // ✅ Apollo Server
    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {

                // ✅ 正确关闭 DB
                const sequelize = container.resolve("Sequelize") as any;
                if (sequelize) await sequelize.close();

                const mongoose = container.resolve("MongoConnection") as any;
                if (mongoose) await mongoose.disconnect();
              },
            };
          },
        },
      ],
    });

    await server.start();

    // ✅ 统一 context（唯一正确入口）
app.use(
  "/graphql",
  express.json(),
  (req, res, next) => {
    (req as any).user = getUserFromContext(req);
    next();
  },
  expressMiddleware(server, {
    context: async ({ req }) => ({
      req,
      user: (req as any).user,
    }),
  })
);

    // ✅ 启动 HTTP
    httpServer.listen({ port: 4050 }, async () => {
      console.log("🚀 Review Subgraph ready at http://localhost:4050/graphql");
    });
  } catch (error) {
    console.error("❌ Server start error:", error);
  }
};

startApolloServer();