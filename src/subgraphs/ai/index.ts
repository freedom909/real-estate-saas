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

import mongoose from "mongoose"
import { container } from "tsyringe"
import {resolvers} from "./resolver"

import registerAuditDependencies from "../audit/container/registerDependencies.js"
import registerAIServiceDependencies from "./container/registerAIServiceDependencies"
import registerListingDependencies from "./container/registerListingDependencies"
import  registerSecurityDependencies  from "../../security/container/register.js";


// ⭐ 注册 DI
registerAuditDependencies(container)
registerSecurityDependencies();
registerListingDependencies(container)
console.log("Listing container loaded")//good

// ⭐ Mongo
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/east"
)

// ⭐ schema
const typeDefs = gql(
  readFileSync("./src/subgraphs/ai/ai.schema.graphql", "utf-8")
)

const schema = buildSubgraphSchema([{
  typeDefs,
  resolvers,
}])

// ⭐ Apollo server
const server = new ApolloServer({
  schema
})

await server.start()

const app = express()
const httpServer = http.createServer(app)

app.use(
  "/graphql",
  cors({
    origin: "http://localhost:3000",
    credentials: true
  }),
  express.json(),
  cookieParser(),
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      req,
      res,
      container,
      user: (req as any).user ?? null
    })
  })
)

httpServer.listen(4070, () => {
  console.log("🔐 AI subgraph running at http://localhost:4070/graphql")
})