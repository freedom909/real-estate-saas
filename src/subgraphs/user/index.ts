//src/subgraphs/user/index.ts
import "reflect-metadata";
import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { readFileSync } from "fs";

import { connectMongo } from "../../shared/db/mongo";
import { registerUserDependencies } from "./registerUserDependencies";
import   resolvers  from "./resolvers/user.resolver";
import UserService from "./services/user.service";
import { container } from "tsyringe";

// 🔍 启动时验证 env
console.log(
  "BOOT USER_SUBGRAPH_URL =",
  process.env.USER_SUBGRAPH_URL
);
// 🥭 1️⃣ Mongo
await connectMongo(
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/north"
);

// 🧰 2️⃣ Container
const userContainer = registerUserDependencies(container);

// 🚀 3️⃣ App
const app = express();
const httpServer = http.createServer(app);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/user/user.schema.graphql",
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
      
      const userHeader = req.headers["x-user"];

      if (userHeader) {
        console.log("🟢 x-user:", userHeader);
      }

      return {
        req,
        user: userHeader ? JSON.parse(userHeader as string) : null,
        container: userContainer,
      };
    },

  })
);

httpServer.listen(4020, () => {
  console.log(
    "👤 User 🔥🔥🔥 WHICH FILE IS THIS 🔥🔥🔥at http://localhost:4020/graphql"
  );
});