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

import registerAuditDependencies from "@/modules/container/audit.register"
import { cacheContainer } from "@/modules/container/cache.register"
import registerListingDependencies from "@/modules/container/listing.register"
import { BookingRegister } from "@/modules/container/booking.register"
import getUserFromToken from "@/infrastructure/auth/getUserFromToken"
import { sequelize, connectMySQL } from "@/infrastructure/config/seq"
import { initBookingModel } from "@/core/booking/infrastructure/models/booking.model"
import { registerWisdom } from "./container/registrations/wisdom.register"
import { registerEventBus } from "@/modules/container/event.bus.register"

// ⭐ 注册 DI
registerAuditDependencies(container)
console.log("  ✅ Audit container loaded")
cacheContainer()
console.log("  ✅ Cache container loaded")
registerListingDependencies()
console.log("  ✅ Listing container loaded")
BookingRegister()
console.log("  ✅ Booking container loaded")
registerWisdom()
console.log("  ✅ Wisdom container loaded")
registerEventBus()
console.log("  ✅ Event Bus container loaded")
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
  readFileSync("./src/wisdom/schemas/schema.graphql", "utf-8")
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

    try {

      const user =
        await getUserFromToken(req);

      return {
        req,
        res,
        container,
        user: user ?? null
      };

    } catch (err) {

      console.error(
        "CONTEXT ERROR",
        err
      );

      return {
        req,
        res,
        container,
        user: null
      };
    }
  }
})
)


httpServer.listen(4200, () => {
  console.log("🔐 wisdom running at http://localhost:4200/graphql")
})
