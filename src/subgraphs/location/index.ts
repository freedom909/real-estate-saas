import "reflect-metadata";
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { readFileSync } from 'fs';
import { gql } from 'graphql-tag';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { sequelize } from "@/infrastructure/config/seq";

import { resolvers } from "./resolvers";
import registerLocationDependencies from "@/modules/container/location.container";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

const startServer = async () => {
  try {
    // 1. Register Dependencies
    registerLocationDependencies();

    // 2. Connect Database
    console.info("Connecting to MySQL...");
    await sequelize.authenticate();
    // In production, use migrations. For this setup:
    // await sequelize.sync(); 
    console.info("MySQL connected.");

    // 3. Setup Apollo Server
    const typeDefs = gql(readFileSync("./src/subgraphs/location/schema.graphql", "utf-8"));
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
      schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });

    await server.start();

    // 4. Middlewares
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

    const PORT = process.env.LOCATION_PORT || 4080;
    httpServer.listen(PORT, () => {
      console.log(`🔐 Location subgraph running at http://localhost:${PORT}/graphql`);
    });
  } catch (error) {
    console.error("Failed to start Location Subgraph:", error);
  }
};

startServer();