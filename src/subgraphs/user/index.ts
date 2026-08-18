// src/subgraphs/user/index.ts

import "reflect-metadata";
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

import  { connectMongo } from "../../shared/db/mongo";
import { registerUserDependencies } from "./registerUserDependencies";
import resolvers from "./resolvers/user.resolver";
import { container } from "tsyringe";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import userRegister from "@/modules/container/user.register";
import dns from "node:dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
// ── 1. Module-level DI registration ──────────────────
userRegister();

// ── 2. MongoDB ───────────────────────────────────────
await connectMongo(process.env.MONGO_URI || "mongodb://localhost:27017/nakano");
console.log("User subgraph — MongoDB connected");

// ── 3. Subgraph-level DI registration ────────────────
const userContainer = registerUserDependencies(container);

// ── 4. Apollo Server ─────────────────────────────────
const schemaPath = path.resolve(__dirname, "user.schema.graphql");
const typeDefs = gql(readFileSync(schemaPath, "utf-8"));

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

await server.start();

app.use(
  "/graphql",
  cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }),
  express.json(),
  async (req, _res, next) => {
    (req as any).user = await getUserFromContext(req);
    next();
  },
  expressMiddleware(server, {
    context: async ({ req }) => ({
      req,
      user: (req as any).user,
      container,
      userContainer,
    }),
  }),
);

httpServer.listen(4020, () => {
  console.log("User subgraph running on http://localhost:4020/graphql");
});
