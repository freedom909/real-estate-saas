//src/subgraphs/user/index.ts
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

// ✅ Define __dirname for ES module scope and load root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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
  "mongodb://localhost:27017/nakano"
);

// 🧰 2️⃣ Container
const userContainer = registerUserDependencies(container);

// 🚀 3️⃣ App
const app = express();
const httpServer = http.createServer(app);

const schemaPath = path.resolve(__dirname, "user.schema.graphql");
const typeDefs = gql(
  readFileSync(schemaPath, "utf-8")
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

      let user = null;
      try {
        if (userHeader && typeof userHeader === "string") {
          user = JSON.parse(userHeader);
        }
      } catch (e) {
        console.error("Failed to parse x-user header:", e);
      }

      return {
        req,
        user,
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