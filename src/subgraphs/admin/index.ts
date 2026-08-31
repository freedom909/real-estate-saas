// src/subgraphs/admin/index.ts

import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import express from "express";
import http from "http";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";
import { container } from "tsyringe";

import { resolvers } from "./resolvers/admin.resolver";
import { sequelize } from "@/infrastructure/config/seq";
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";
import registerAdminDependencies from "@/modules/container/admin.register";

import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

console.info("Admin subgraph configuration loaded");

registerAuthDependencies(container);
registerAdminDependencies();
registerUserDependencies(container);

const typeDefs = gql(
  readFileSync("./src/subgraphs/admin/schema.graphql", { encoding: "utf-8" })
);

const startApolloServer = async () => {
  try {
    console.info("Connecting to MySQL...");
if (process.env.NODE_ENV === "development") {
    await sequelize.authenticate()
}


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
        }),
      })
    );

    httpServer.listen({ port: 4104, host: "0.0.0.0" }, () =>
      console.info(
        "Admin Subgraph running on http://0.0.0.0:4104/graphql"
      )
    );
  } catch (error) {
    console.error("Error starting Apollo Server for Admin Subgraph:", error);
  }
};

startApolloServer();
