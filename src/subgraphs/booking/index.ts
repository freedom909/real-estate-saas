import "reflect-metadata";

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import express from "express";
import http from "http";

import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import type { RequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { resolvers } from "./interface/resolvers";
import { initializeBookingContainer } from "@/infrastructure/container/initBookingContainer";
import { initMongoContainer } from "@/infrastructure/container/initMongoContainer";

import { container } from "tsyringe";
import getUserFromToken from "@/infrastructure/auth/getUserFromToken";
import bookingConsumer from "@/MQ/consumer/bookingConsumer";
import { RabbitMQEventBus } from "./interface/events/rabbitmq-event-bus";
import TOKENS from "@/modules/tokens/mq.tokens";
import registerMQEventBus from "@/modules/container/mq.register";
dotenv.config();

registerMQEventBus();
const eventBus = container.resolve<RabbitMQEventBus>(TOKENS.eventBus);
await eventBus.init();

const typeDefs = gql(
  readFileSync("./src/subgraphs/booking/schema.graphql", { encoding: "utf-8" })
);

const startApolloServer = async () => {
  try {
    // ✅ 初始化 DI（全局 container）
    console.log("⏳ Initializing containers...");
    await initializeBookingContainer();
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
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      const user = await getUserFromToken(token);

      return { user, container };
    },
  }) as unknown as RequestHandler // ✅ 关键
);

    // ✅ 启动 HTTP
    httpServer.listen({ port: 4070 }, async () => {
      console.log("🚀 Server ready at http://localhost:4070/graphql");

      // ✅ MQ consumer
      try {
        await bookingConsumer.startConsuming();
        console.log("✅ Booking MQ Consumer started");
      } catch (error) {
        console.error("❌ MQ Consumer error:", error);
      }
    });
  } catch (error) {
    console.error("❌ Server start error:", error);
  }
};

startApolloServer();