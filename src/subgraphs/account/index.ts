import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dotenv must be configured BEFORE any other local imports
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import express from "express";
import http from "http";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { container } from "tsyringe";

import { resolvers } from "./account.resolver";
import { sequelize } from "@/infrastructure/config/seq";
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";
import registerAccountDependencies from "@/modules/container/account.register";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import registerTenantDependencies from "@/modules/container/tenant.register";

// Register all dependencies
registerAccountDependencies();
registerAuthDependencies(container);
registerUserDependencies(container);
registerTenantDependencies(container);
registerAccountDependencies();

console.info("Account subgraph configuration loaded");

const typeDefs = gql(
  readFileSync(
    path.resolve(__dirname, "schema.graphql"),
    { encoding: "utf-8" }
  )
);

const startApolloServer = async () => {
  try {
    console.info("Connecting to MySQL...");
    await sequelize.authenticate();
    console.info("MySQL connected");

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                container.clearInstances();
              },
            };
          },
        },
      ],
    });

    await server.start();

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
          internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN,
        }),
      })
    );

    httpServer.listen({ port: 4102 }, () =>
      console.info("Account Subgraph running on http://localhost:4102/graphql")
    );
  } catch (error) {
    console.error("Error starting Apollo Server for Account Subgraph:", error);
  }
};

startApolloServer();
