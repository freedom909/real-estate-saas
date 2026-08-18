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

import { sequelize } from "@/infrastructure/config/seq";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";
import { initAssociations } from "@/core/listing/infrastructure/models/associations";
import { resolvers } from './resolvers/listing.resolver';
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";
import registerListingDependencies from "@/modules/container/listing.register";
import { registerPicture } from "@/modules/container/picture.register";
import "@/shared/category/container";
import { registerAIContainer } from "@/modules/container/ai.register";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import { initPictureModel } from "@/core/listing/infrastructure/models/picture.model";
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";

console.log(TOKENS_LISTING.adapters.amenityAdapter);
console.info("Listing subgraph configuration loaded");

registerAIContainer()
registerAuthDependencies(container);

registerListingDependencies();
registerPicture();
registerUserDependencies(container);

initPictureModel(sequelize);
initAssociations();

const typeDefs = gql(readFileSync('./src/subgraphs/listing/schema.graphql', { encoding: 'utf-8' }));

const startApolloServer = async () => {
  try {
    console.info("Connecting to MySQL...");

    await sequelize.sync({ alter: true });

    // Clean up orphaned pictures before sync to avoid FK constraint errors
    await sequelize.query(`
      DELETE p FROM pictures p
      LEFT JOIN listings l ON p.listingId = l.id
      WHERE l.id IS NULL
    `);

    await sequelize.sync({ alter: true });

    console.info("MySQL connected");

    const app = express();
    app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema({ typeDefs, resolvers }),
      csrfPrevention: false,
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
      graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }),
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

    httpServer.listen({ port: 4101 }, () =>
      console.info('Listing Subgraph running on http://localhost:4101/graphql')
    );
  } catch (error) {
    console.error('Error starting Apollo Server for Listing Subgraph:', error);
  }
};

startApolloServer();