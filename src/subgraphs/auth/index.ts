import "reflect-metadata"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// ✅ Define __dirname for ES module scope and load root .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
import dns from 'dns';
dns.setServers(["8.8.8.8", "1.1.1.1"]);
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
import resolvers from "./resolvers"


import registerAuthDependencies from "./registerAuthDependencies"
import  registerSecurityDependencies  from "../../modules/container/security.register";
import registerAuditDependencies from "../../modules/container/audit.register.js"
import getUserFromContext from "@/infrastructure/auth/getUserFromContext"
import { verifyInternalServiceRequest } from "@/infrastructure/auth/verifyInternalServiceRequest";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
// ── 1. Module-level DI registration ──────────────────
registerAuthDependencies(container);
// ⭐ 注册 DI
registerAuditDependencies(container)
registerSecurityDependencies();
registerAuthDependencies(container)
console.log("OAuth container loaded")


// ⭐ Mongo
await mongoose.connect(
  process.env.MONGO_URI || "mongodb://localhost:27017/nakano"
)

// ⭐ schema
const schemaPath = path.resolve(__dirname, "schema.graphql");
const typeDefs = gql(
  readFileSync(schemaPath, "utf-8")
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
  verifyInternalServiceRequest,
  express.json(),
  cookieParser(),
  // ✅ Parse gateway-forwarded user from x-gateway-user header (same as account/admin subgraphs)
  async (req, _res, next) => {
    console.log("[Auth incoming auth diagnostic]", {
  gatewayUserPresent: Boolean(req.headers["x-gateway-user"]),
  authorizationPresent: Boolean(req.headers.authorization),
  authorizationIsBearer:
    typeof req.headers.authorization === "string" &&
    /^Bearer\s+/i.test(req.headers.authorization),
  authorizationSegmentCount:
    typeof req.headers.authorization === "string" &&
    /^Bearer\s+/i.test(req.headers.authorization)
      ? req.headers.authorization.replace(/^Bearer\s+/i, "").split(".").length
      : 0,
});

console.log("[AUTH JWT INPUT]", {
  gatewayUserPresent: Boolean(req.headers["x-gateway-user"]),
  gatewayUserIsString:
    typeof req.headers["x-gateway-user"] === "string",
  authorizationPresent: Boolean(req.headers.authorization),
  authorizationIsString:
    typeof req.headers.authorization === "string",
  authorizationIsBearer:
    typeof req.headers.authorization === "string" &&
    /^Bearer\s+/i.test(req.headers.authorization),
  jwtSegmentCount:
    typeof req.headers.authorization === "string" &&
    /^Bearer\s+/i.test(req.headers.authorization)
      ? req.headers.authorization.replace(/^Bearer\s+/i, "").split(".").length
      : 0,
});
    (req as any).user = await getUserFromContext(req);
    next();
  },
  expressMiddleware(server, {
    context: async ({ req, res }) => ({
      req,
      res,
      container,
      user: (req as any).user ?? null
    })
  })
)

httpServer.listen(4010, "0.0.0.0", () => {
  console.log("🔐 Auth subgraph running at http://0.0.0.0:4010/graphql")
})
