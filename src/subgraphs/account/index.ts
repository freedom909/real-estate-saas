import "reflect-metadata"
import dotenv from 'dotenv';
dotenv.config();
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { gql } from 'graphql-tag';
import { readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import { expressMiddleware } from "@as-integrations/express4"
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { container } from "tsyringe";

import { resolvers } from './account.resolver';
import { sequelize } from "@/infrastructure/config/seq";
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";
import { TOKENS_ACCOUNT } from "@/modules/tokens/account.tokens";
import registerAccountDependencies from "@/modules/container/account.register";


await AccountModel.sync();
console.log(TOKENS_ACCOUNT.adapters.amenityAdapter);
console.info("Account subgraph configuration loaded");

import "@/shared/category/container";  // 👈 必须
import { registerAIContainer } from "@/modules/container/ai.register";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import AccountModel from "@/core/account/infrastructure/models/account.model";


registerAIContainer()
registerAuthDependencies(container);

registerAccountDependencies();
registerUserDependencies(container);

const typeDefs = gql(readFileSync('./src/subgraphs/account/schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // For MySQL, you would initialize your ORM (e.g., TypeORM, Sequelize) here.
    // Example: await AppDataSource.initialize();
    console.info("Connecting to MySQL...");

await sequelize.authenticate();
await sequelize.sync({ alter: true }); // Ensure ListingModel schema is updated

console.info("MySQL connected");

    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({typeDefs, resolvers, container, context: ({ req }) => ({ req, user: (req as any).user })}),
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        {
          async serverWillStart() {
            return {
              async drainServer() {
                container.clearInstances(); // Clear tsyringe instances on shutdown
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

    httpServer.listen({ port: 4102 }, () =>
      console.info('Account Subgraph running on http://localhost:4102/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server for Account Subgraph:', error);
  }
};

startApolloServer();
