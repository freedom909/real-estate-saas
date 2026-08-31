// src/subgraphs/admin/index.ts

import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

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
import mongoose from "mongoose";

import { resolvers } from "./resolvers/admin.resolver";
import { sequelize } from "@/infrastructure/config/seq";
import registerAuthDependencies from "../auth/registerAuthDependencies";
import { registerUserDependencies } from "../user/registerUserDependencies";
import registerAdminDependencies from "@/modules/container/admin.register";
import registerAuditDependencies from "@/modules/container/audit.register";

import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

console.info("Admin subgraph configuration loaded");

registerAuditDependencies(container);
registerAuthDependencies(container);
registerAdminDependencies();
registerUserDependencies(container);

const typeDefs = gql(
  readFileSync("./src/subgraphs/admin/schema.graphql", { encoding: "utf-8" })
);

const startApolloServer = async () => {
  try {
    const primaryUri = process.env.MONGO_URI || "mongodb://localhost:27017/nakano";
    const fallbackUri = "mongodb://localhost:27017/nakano";
    console.info("Connecting to MongoDB...");
    console.info("MONGO_URI (primary) =", primaryUri);
    try {
      await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 5000,
      });
    } catch (primaryErr: any) {
      console.warn("Primary MongoDB failed:", primaryErr?.code ?? primaryErr?.message ?? primaryErr);
      if (primaryUri !== fallbackUri) {
        console.info("Falling back to local MongoDB:", fallbackUri);
        await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
      } else {
        throw primaryErr;
      }
    }
    console.info("Connected to MongoDB (Mongoose) at", mongoose.connection.name);

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
                if (mongoose) await mongoose.disconnect();
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
