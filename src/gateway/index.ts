// Gateway

import "reflect-metadata";

import dotenv from "dotenv";

import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

// 加载根目录 .env

dotenv.config({

  path: path.resolve(__dirname, "../../.env"),

});

// 企业级防御：缺少 secret 直接退出

if (!process.env.ACCESS_TOKEN_SECRET) {

  console.error("❌ ACCESS_TOKEN_SECRET is missing");

  process.exit(1);

}

console.log("✅ GATEWAY SECRET loaded");
import express from "express"
import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@as-integrations/express4"
import cors from "cors"
import { ApolloGateway, RemoteGraphQLDataSource, IntrospectAndCompose } from "@apollo/gateway"
import { createAuthPlugin } from "@/gateway/plugins/auth.plugin"
import tenantRouter from "@/gateway/routes/tenantRouter"
import uploadRouter from "@/gateway/routes/uploadRouter"
import imageRouter from "@/gateway/routes/imageRouter"

import getUserFromContext from "@/infrastructure/auth/getUserFromContext"
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs"
import dns from 'dns';

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ---------- Subgraph URL helpers (env overrides, fallback to ECS host / localhost) ----------
const SUBGRAPH_HOST = process.env.SUBGRAPH_HOST ?? "127.0.0.1";
function subgraphUrl(envName: string, defaultPort: number): string {
  const explicit = process.env[envName];
  if (explicit) return explicit;
  return `http://${SUBGRAPH_HOST}:${defaultPort}/graphql`;
}

const CORS_ORIGIN_ALLOWED = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
    : [
        process.env.FRONTEND_URL ?? "http://localhost:3000",
        "https://minshuku.info",
        "https://www.minshuku.info",
        "http://localhost:3000",
      ]
).filter(Boolean);

async function start() {
  // Connect to MongoDB for REST routes (tenant API)
  const { default: mongoose } = await import("mongoose");
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nakano";
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8_000,
    heartbeatFrequencyMS: 5_000,
  });
  console.log("✅ MongoDB connected for gateway");

  // Register Session model so auth.plugin can look up activeTenantId
  const sessionSchema = new mongoose.Schema(
    {
      id: String,
      userId: String,
      familyId: String,
      deviceId: String,
      userAgentHash: String,
      ipHash: String,
      refreshTokenId: String,
      revoked: { type: Boolean, default: false },
      revokedAt: Date,
      lastSeenAt: Date,
      expiresAt: Date,
      status: { type: String, default: "ACTIVE" },
      activeTenantId: { type: String, default: null },
    },
    { timestamps: true }
  );
  mongoose.model("Session", sessionSchema);
  console.log("✅ Session model registered in gateway");

  console.log("start gateway")
  console.log("========== SUBGRAPH URLS ==========");

console.log(
  "AUTH   =",
  subgraphUrl("AUTH_SUBGRAPH_URL", 4010)
);

console.log(
  "USER   =",
  subgraphUrl("USER_SUBGRAPH_URL", 4020)
);

console.log(
  "BOOKING =",
  subgraphUrl("BOOKING_SUBGRAPH_URL", 4030)
);

console.log(
  "REVIEW =",
  subgraphUrl("REVIEW_SUBGRAPH_URL", 4040)
);

console.log(
  "TENANT =",
  subgraphUrl("TENANT_SUBGRAPH_URL", 4060)
);

console.log("==================================");
  const gateway = new ApolloGateway({
    
    supergraphSdl: new IntrospectAndCompose({
      pollIntervalInMs: 10000,
      subgraphs: [
        { name: "auth",     url: subgraphUrl("AUTH_SUBGRAPH_URL",     4010) },
        { name: "user",     url: subgraphUrl("USER_SUBGRAPH_URL",     4020) },
        { name: "booking",  url: subgraphUrl("BOOKING_SUBGRAPH_URL",  4030) },
        { name: "review",   url: subgraphUrl("REVIEW_SUBGRAPH_URL",   4040) },
        { name: "payment",  url: subgraphUrl("PAYMENT_SUBGRAPH_URL",  4050) },
        { name: "tenant",   url: subgraphUrl("TENANT_SUBGRAPH_URL",   4060) },// does it mean that it must have a TENANT_SUBGRAPH_URL env variable in the .env file?
        { name: "audit",    url: subgraphUrl("AUDIT_SUBGRAPH_URL",    4070) },
        { name: "location", url: subgraphUrl("LOCATION_SUBGRAPH_URL", 4080) },
        { name: "amenity",  url: subgraphUrl("AMENITY_SUBGRAPH_URL",  4090) },
        { name: "calendar", url: subgraphUrl("CALENDAR_SUBGRAPH_URL", 4100) },
        { name: "listing",  url: subgraphUrl("LISTING_SUBGRAPH_URL",  4101) },
        { name: "account",  url: subgraphUrl("ACCOUNT_SUBGRAPH_URL",  4102) },
        { name: "cart",     url: subgraphUrl("CART_SUBGRAPH_URL",     4103) },
        { name: "admin",    url: subgraphUrl("ADMIN_SUBGRAPH_URL",    4104) },
        { name: "wisdom",   url: subgraphUrl("WISDOM_SUBGRAPH_URL",   4200) },
        { name: "voice",    url: subgraphUrl("VOICE_SUBGRAPH_URL",    4300) },
      ]
    }),
    buildService({ url }) {

      return new RemoteGraphQLDataSource({

        url,

        willSendRequest({ request, context }) {
          const auth = context?.authorization;

          if (auth) {

            request.http.headers.set(

              "authorization",

              auth

            );

          }

          // Forward decoded user from auth plugin to subgraphs
          if (context?.user) {
            request.http.headers.set(
              "x-gateway-user",
              JSON.stringify(context.user)
            );
          }

          // Forward active tenant ID to subgraphs
          if (context?.tenantId) {
            request.http.headers.set(
              "x-tenant-id",
              context.tenantId
            );
          }

   
        },
      });

    }
  });

  console.log("gateway:", gateway)
  const enableAuth = process.env.ENABLE_GATEWAY_AUTH !== "false";
  const server = new ApolloServer({
    gateway,
    plugins: enableAuth ? [createAuthPlugin()] : [],
    // Disable CSRF prevention — uploads use multipart/form-data which is blocked by default
    csrfPrevention: false,
  })

  await server.start()
  const app = express()

  // CORS for all routes — allow frontend prod domains + localhost dev, override via CORS_ORIGINS env
  app.use(cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = CORS_ORIGIN_ALLOWED.some((o) => o === origin || origin.startsWith(o));
      if (allowed) return callback(null, true);
      // Also allow any subdomain of minshuku.info for future Pages projects
      try {
        const host = new URL(origin).hostname;
        if (host === "minshuku.info" || host.endsWith(".minshuku.info")) {
          return callback(null, true);
        }
      } catch {}
      return callback(new Error(`CORS blocked origin=${origin}`));
    },
    credentials: true,
  }))
  app.use(express.json())

  // REST API routes
  app.use("/api/tenants", tenantRouter)
  app.use("/api/upload", uploadRouter)
  app.use("/api/images", imageRouter)

  // Serve uploaded files as static assets
  app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")))

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  })

  // GraphQL endpoint
  app.use("/graphql",
    graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 10 }),
    async (req, res, next) => {

      console.log("🔥 GATEWAY AUTH =>", req.headers.authorization);

      (req as any).user = await getUserFromContext(req);

      console.log("🔥 GATEWAY USER =>", (req as any).user);

      next();

    },
    expressMiddleware(server, {
context: async ({ req }) => ({
    authorization: req.headers.authorization,
    user: (req as any).user,
    tenantId: (req as any).user?.tenantId,
}),
    }))

  const PORT = parseInt(process.env.PORT || "4000", 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Gateway running at http://0.0.0.0:${PORT}/graphql`)
  })
}
start()
