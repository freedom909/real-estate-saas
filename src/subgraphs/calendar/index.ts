// src/subgraphs/calendar/index.ts
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
import { container } from "tsyringe";

import { sequelize } from "@/infrastructure/config/seq";
import { resolvers } from "./resolvers/calendar.resolver";
import { initCalendarSlotModel } from "@/core/calendar/infrastructure/models/calendar-slot.model";
import registerCalendarDependencies from "@/modules/container/calendar.register";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

// ── Initialize ──
initCalendarSlotModel(sequelize);
registerCalendarDependencies();

const schemaPath = path.resolve(__dirname, "schema.graphql");
const typeDefs = gql(readFileSync(schemaPath, { encoding: "utf-8" }));

const startApolloServer = async () => {
  try {
    console.info("⏳ Calendar Subgraph connecting to MySQL...");
    await sequelize.authenticate();
   // await sequelize.sync({ alter: true });
    console.info("✅ Calendar Subgraph MySQL connected");

    const app = express();
    app.use(
      cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
      })
    );
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

    httpServer.listen({ port: 4100, host: "0.0.0.0" }, () =>
      console.info(
        "📅 Calendar Subgraph running on http://0.0.0.0:4100/graphql"
      )
    );
  } catch (error) {
    console.error(
      "❌ Error starting Apollo Server for Calendar Subgraph:",
      error
    );
  }
};

startApolloServer();
