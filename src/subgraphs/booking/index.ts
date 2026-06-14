import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";

// ✅ Dotenv must be configured BEFORE any other local imports that use environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

console.log("Booking Subgraph - Secret Check:", {
  hasAccessTokenSecret: !!process.env.ACCESS_TOKEN_SECRET,
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasServiceToken: !!process.env.INTERNAL_SERVICE_TOKEN
});

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

import { resolvers } from "./resolvers";
import { initializeBookingContainer } from "@/infrastructure/container/initBookingContainer";
import { initMongoContainer } from "@/infrastructure/container/initMongoContainer";

import { container } from "tsyringe";
import getUserFromToken from "@/infrastructure/auth/getUserFromToken";
import bookingConsumer from "@/MQ/consumer/bookingConsumer";

import TOKENS_MQ from "@/modules/tokens/mq.tokens";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { UserClient } from "@/packages/user-sdk/src/client/user.client";
import registerMQEventBus from "@/modules/container/mq.register";
import { RabbitMQEventBus } from "@/core/booking/interface/events/rabbitmq-event-bus";

registerMQEventBus();
const eventBus = container.resolve<RabbitMQEventBus>(TOKENS_MQ.eventBus);
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

    // ✅ Register UserClient for getUserFromToken to use
    container.register(TOKENS_USER.userClient, {
      useFactory: () =>
        new UserClient(
         process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql",
         process.env.INTERNAL_SERVICE_TOKEN
        ),
    });

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
//    app.use(
//   "/graphql",
//   cors(),
//   express.json(),
//   expressMiddleware(server, {
//     context: async ({ req }) => {
//       const token = req.headers.authorization || "";
//       const user = await getUserFromToken(token);

//       return { user, container };
//     },
//   }) as unknown as RequestHandler // ✅ 关键
// );

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {

      const authHeader =
        req.headers.authorization || "";

      let user = null;

      if (authHeader.startsWith("Bearer ")) {

        const token =
          authHeader.split(" ")[1];

          try {
            user = await getUserFromToken(token);
          } catch (error) {
            // Log the actual error for better debugging
            console.error("JWT Verification Error:", error);
            console.warn("Unauthorized request: Token verification failed.", error instanceof Error ? error.message : "");
          }
      }

      return {
        user,
        container
      };
    },
  }) as unknown as RequestHandler
);
    // ✅ 启动 HTTP
    httpServer.listen({ port: 4030 }, async () => {
      console.log("🚀 Server ready at http://localhost:4030/graphql");

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