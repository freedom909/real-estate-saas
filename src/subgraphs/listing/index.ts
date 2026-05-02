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
import cors from 'cors';
import { container } from "tsyringe";
import { registerListingDependencies } from "./container/registerListingDependencies";
import { resolvers } from './resolvers/resolver';
import { sequelize } from "@/infrastructure/config/seq";
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";

console.info("Listing subgraph configuration loaded");
// Register all dependencies for the listing subgraph


registerAuthDependencies(container);
registerListingDependencies();
registerUserDependencies(container);

const typeDefs = gql(readFileSync('./src/subgraphs/listing/schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    // For MySQL, you would initialize your ORM (e.g., TypeORM, Sequelize) here.
    // Example: await AppDataSource.initialize();
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
                container.clearInstances(); // Clear tsyringe instances on shutdown
              },
            };
          },
        },
      ],
    });

    await server.start();

    app.use(
      '/graphql',
      cors(),
      express.json(),
      expressMiddleware(server)
    );

    httpServer.listen({ port: 4101 }, () =>
      console.info('Listing Subgraph running on http://localhost:4101/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server for Listing Subgraph:', error);
  }
};

startApolloServer();
