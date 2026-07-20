import "reflect-metadata";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import express from "express";
import http from "http";
import { expressMiddleware } from "@as-integrations/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import cors from "cors";

import { resolvers } from "./resolvers";
import { sequelize } from "@/infrastructure/config/seq";
import { CartModel } from "@/core/cart/infrastructure/models/cart.model";
import { CartItemModel } from "@/core/cart/infrastructure/models/cartItem.model";

import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

const startApolloServer = async () => {
  try {
    const schemaPath = path.resolve(__dirname, "schema.graphql");
    const typeDefs = gql(readFileSync(schemaPath, { encoding: "utf-8" }));

    await sequelize.authenticate();
    await CartModel.sync({ alter: true });
    await CartItemModel.sync({ alter: true });
    console.log("✅ Cart subgraph MySQL connected & models synced");

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
                await sequelize.close();
              },
            };
          },
        },
      ],
    });

    await server.start();

    app.use(
      "/graphql",
      cors(),
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

    httpServer.listen({ port: 4103 }, () => {
      console.log("🚀 Cart Subgraph running at http://localhost:4103/graphql");
    });
  } catch (error) {
    console.error("❌ Cart subgraph start error:", error);
  }
};

startApolloServer();
