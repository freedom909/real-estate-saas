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
import { connectMongo } from "../../shared/db/mongo.js";
import mongoose from "mongoose"
import { container } from "tsyringe"

import{ resolvers }from "./resolvers/tenant.resolver"

import registerDependencies from "./container/registerDependencies"


// 🔍 启动时验证 env
console.log(
  "BOOT USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// 🥭 1️⃣ Mongo
await connectMongo(
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/east"
);

// 🧰 2️⃣ Container
const tenantContainer = registerDependencies(container);

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
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
        console.log("User received headers:", req.headers);
      const userHeader = req.headers["x-user"];

      if (userHeader) {
        console.log("🟢 x-user:", userHeader);
      }

      return {
        user: userHeader ? JSON.parse(userHeader as string) : null,
        container: tenantContainer,
      };
    },

  })
);

httpServer.listen(4040, () => {
  console.log(
    "👤 Tenant 🔥🔥🔥 WHICH FILE IS THIS 🔥🔥🔥at http://localhost:4040/graphql"
  );
});