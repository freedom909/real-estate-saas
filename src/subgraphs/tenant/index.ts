import "reflect-metadata"
import "dotenv/config"

import express from "express"
import http from "http"


import { gql } from "graphql-tag"
import { readFileSync } from "fs"
import dns from 'dns';

import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import { buildSubgraphSchema } from "@apollo/subgraph"
import mongoose, { connectMongo } from "../../shared/db/mongo";

import { container } from "tsyringe"
import { registerTenantDependencies } from "../../modules/container/tenant.container"
import { resolvers } from "./resolvers/resolver"
import getUserFromContext from "@/infrastructure/auth/getUserFromContext"

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// 🔍 启动时验证 env
console.log(
  "BOOT USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// 🥭 1️⃣ Mongo
const mongoUri =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/nakano";

console.log(
  "TENANT MONGO SOURCE =",
  mongoUri.includes("mongodb+srv://")
    ? "ATLAS"
    : mongoUri
);

await connectMongo(mongoUri);
console.log(
  "TENANT MONGO COLLECTIONS =",
  (await mongoose.connection.db?.listCollections().toArray())
    ?.map((c) => c.name)
);

const db = mongoose.connection.db;
const rawMemberships = await db
  ?.collection("memberships")
  .find({})
  .limit(5)
  .toArray();

console.log(
  "RAW MEMBERSHIP TYPES =",
  rawMemberships?.map((m: any) => ({
    userId: m.userId,
    userIdType: typeof m.userId,
    tenantId: m.tenantId,
    tenantIdType: typeof m.tenantId,
    role: m.role,
    status: m.status,
  }))
);


console.log(
  "TENANTS COUNT =",
  await db?.collection("tenants").countDocuments()
);

console.log(
  "MEMBERSHIPS COUNT =",
  await db?.collection("memberships").countDocuments()
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
  async (req, _res, next) => {
    (req as any).user = await getUserFromContext(req);
    next();
  },
  expressMiddleware(server, {
  context: async ({ req }) => {
  return {
    req,
    user: (req as any).user,
    container: tenantContainer,
  };
},
  })
);

httpServer.listen(4060, "0.0.0.0", () => {
  console.log(
    "👤 Tenant Subgraph running at http://0.0.0.0:4060/graphql"
  );
});
