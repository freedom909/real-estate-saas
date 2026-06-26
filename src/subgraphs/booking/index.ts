import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Dotenv must be configured BEFORE any other local imports that use environment variables
// This ensures we find the .env in the root, even if we are deep in the tree
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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
import { BookingMQEventBus } from "@/core/booking/interface/events/booking-event-bus";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

const startApolloServer = async () => {
  try {
    // ✅ Robust Path Resolution for Schema
    const schemaPath = path.resolve(__dirname, "schema.graphql");
    const typeDefs = gql(readFileSync(schemaPath, { encoding: "utf-8" }));
    console.log("📖 Schema loaded from:", schemaPath);

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

    // ✅ MQ Initialize (inside startup to catch errors)
    registerMQEventBus();
    const eventBus = container.resolve<BookingMQEventBus>(TOKENS_MQ.eventBus);
    await eventBus.init();
    console.log("✅ RabbitMQ Event Bus initialized");

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
    console.log("✅ Apollo Server started");

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