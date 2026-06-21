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
import {resolvers} from "./resolvers/resolvers"
import AIPlatformDependencies from "./container/registers/ai-platform.register"
import registerAuditDependencies from "@/modules/container/audit.register"
import { cacheContainer } from "@/modules/container/cache.register"
import getUserFromToken from "@/infrastructure/auth/getUserFromToken"
import { sequelize, connectMySQL } from "@/infrastructure/config/seq"
import { initBookingModel } from "@/core/booking/infrastructure/models/booking.model"

// ⭐ 注册 DI
registerAuditDependencies(container)
console.log("Audit container loaded")
cacheContainer()
console.log("Cache container loaded")
AIPlatformDependencies()
console.log("AI Platform container loaded")

// ⭐ MySQL — initialize BookingModel so SequelizeBookingRepository works
await connectMySQL()
initBookingModel(sequelize)
console.log("✅ MySQL connected & BookingModel initialized")

// ⭐ Mongo
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/kawaka"
)

// ⭐ schema
const typeDefs = gql(
  readFileSync("./src/ai-platform/schemas/schema.graphql", "utf-8")
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
    context: async ({ req, res }) => {
      const user = await getUserFromToken(req)
      return {
        req,
        res,
        container,
        user: user ?? null
      }
    }
  })
)

httpServer.listen(4200, () => {
  console.log("🔐 ai-platfrom  running at http://localhost:4200/graphql")
})
