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

console.log("Payment Subgraph - Secret Check:", {
  hasAccessTokenSecret: !!process.env.ACCESS_TOKEN_SECRET,
  hasRefreshTokenSecret: !!process.env.REFRESH_TOKEN_SECRET,
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
import  resolvers  from "./payment.resolver";
import { container } from "tsyringe";
import getUserFromToken from "@/infrastructure/auth/getUserFromToken";


import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { UserClient } from "@/packages/user-sdk/src/client/user.client";

import { PaymentRegister } from "@/modules/container/payment.register";
import { BookingMQEventBus } from "@/core/booking/interface/events/booking-event-bus";
import bookingConsumer from "@/MQ/consumer/bookingConsumer";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import { registerEventBus } from "@/modules/container/event.bus.register";
import PaymentModel from "@/core/payment/infra/model/payment.model";


const startApolloServer = async () => {
  try {
    // ✅ Robust Path Resolution for Schema
    const schemaPath = path.resolve(__dirname, "schema.graphql");
    const typeDefs = gql(readFileSync(schemaPath, { encoding: "utf-8" }));
    console.log("📖 Schema loaded from:", schemaPath);
    
 
    console.log("✅ Containers initialized");
    await PaymentModel.sync({ alter: true });
    console.log("✅ Payment Model synchronized");
    
    console.log("✅ Database connected");
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
    PaymentRegister();
    registerEventBus();
   console.log(
  "🐰 ENV RabbitMQ:",
  process.env.RABBITMQ_URL
);
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

    app.use(
      "/graphql",
      express.json(),
      async (req, _res, next) => {
        (req as any).user = await getUserFromContext(req);
        next();
      },
      expressMiddleware(server, {
        context: async ({ req }) => ({
          req,
          user: (req as any).user,
        }),
      })
    );

    const PORT = process.env.PAYMENT_PORT || 4050;
    httpServer.listen({ port: PORT }, () => {
      console.log(`💳 Payment subgraph running on http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("❌ Failed to start Payment Subgraph:", error);
    process.exit(1);
  }
};

startApolloServer();
