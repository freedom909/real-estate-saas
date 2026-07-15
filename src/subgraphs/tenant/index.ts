import "reflect-metadata"
import "dotenv/config"

import express from "express"
import http from "http"
import cors from "cors"
import cookieParser from "cookie-parser"

import { gql } from "graphql-tag"
import { readFileSync } from "fs"

import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import { buildSubgraphSchema } from "@apollo/subgraph"
import { connectMongo } from "../../shared/db/mongo";
import mongoose from "mongoose"
import { container } from "tsyringe"
import { registerTenantDependencies } from "../../modules/container/tenant.container"
import { resolvers } from "./resolvers/tenant.resolver"
import getUserFromContext from "@/infrastructure/auth/getUserFromContext"


// 🔍 启动时验证 env
console.log(
  "BOOT USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// 🥭 1️⃣ Mongo
await connectMongo(
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/nakano"
);

// 🧰 2️⃣ Container
const tenantContainer = registerTenantDependencies(container);

// 🚀 3️⃣ App
const app = express();
const httpServer = http.createServer(app);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/tenant/tenant.schema.graphql",
    "utf-8"
  )
);

const server = new ApolloServer({
  schema: buildSubgraphSchema([
    
    { typeDefs, resolvers},//
  ]),
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

httpServer.listen(4060, () => {
  console.log(
    "👤 Tenant Subgraph running at http://localhost:4060/graphql"
  );
});