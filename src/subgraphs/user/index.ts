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

import mongoose, { connectMongo } from "../../shared/db/mongo";
import { registerUserDependencies } from "./registerUserDependencies";
import   resolvers  from "./resolvers/user.resolver";

import { container } from "tsyringe";
import getUserFromContext from "@/infrastructure/auth/getUserFromContext";
import userRegister from "@/modules/container/user.register";
import UserModel from "./infra/models/user.model";

// 🔍 启动时验证 env
userRegister();

// 🥭 1️⃣ Mongo
await connectMongo(process.env.MONGO_URI ||"mongodb://localhost:27017/nakano");
console.log("MongoDB connected",process.env.MONGO_URI);
const collections = await mongoose.connection.db.listCollections().toArray();

console.log("🔥 MONGO DB =", mongoose.connection.name);
console.log("🔥 MONGO HOST =", mongoose.connection.host);

const docs = await mongoose.connection.db
  .collection("users")
  .find({})
  .toArray();

console.log("🔥 USERS COUNT =", docs.length);
console.log("🔥 USERS =", docs);

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
async (req, _res, next) => {
  console.log("======================================");
  console.log("🔥 USER REQUEST");
  console.log("METHOD:", req.method);
  console.log("PATH:", req.path);
  console.log("AUTHORIZATION:", req.headers.authorization);
  console.log("COOKIE:", req.headers.cookie);

  const user = await getUserFromContext(req);

  console.log("🔥 getUserFromContext() =", user);
  console.log("======================================");

  (req as any).user = user;

  next();
},
  expressMiddleware(server, {
    context: async ({ req }) => ({
      req,
      user: (req as any).user,
      container,
      userContainer,
    }),
    
  })
);
console.log(
  "USERS =",
  __filename,
  await UserModel.find() //no output
);
httpServer.listen(4020, () => {
  console.log(
    "👤 User 🔥🔥🔥 WHICH FILE IS THIS 🔥🔥🔥at http://localhost:4020/graphql"
  );
});
