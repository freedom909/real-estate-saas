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
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";

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

  express.json(),
  (req,res,next)=>{
     console.log(
     "🔥🔥🔥 USER REQUEST ARRIVED"
   );

   console.log(
     "METHOD:",
     req.method
   );

   console.log(
     "BODY:",
     req.body
   );
      next();

 },
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

httpServer.listen(4020, () => {
  console.log(
    "👤 User 🔥🔥🔥 WHICH FILE IS THIS 🔥🔥🔥at http://localhost:4020/graphql"
  );
});