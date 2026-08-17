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
async function start() {
  // Connect to MongoDB for REST routes (tenant API)
  const { default: mongoose } = await import("mongoose");
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/nakano";
  await mongoose.connect(mongoUri);
  console.log("✅ MongoDB connected for gateway");

  console.log("start gateway")
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      pollIntervalInMs: 10000,
      subgraphs: [
        { name: "auth", url: "http://localhost:4010/graphql" },
        { name: "user", url: "http://localhost:4020/graphql" },
        { name: "booking", url: "http://localhost:4030/graphql" },
        { name: "review", url: "http://localhost:4040/graphql" },
        { name: "payment", url: "http://localhost:4050/graphql" },
        { name: "tenant", url: "http://localhost:4060/graphql" },
        { name: "audit", url: "http://localhost:4070/graphql" },
        { name: "location", url: "http://localhost:4080/graphql" },
        { name: "amenity", url: "http://localhost:4090/graphql" },
        { name: "calendar", url: "http://localhost:4100/graphql" },
        { name: "listing", url: "http://localhost:4101/graphql" },
        { name: "account", url: "http://localhost:4102/graphql" },
        { name: "cart", url: "http://localhost:4103/graphql" },
        { name: "admin", url: "http://localhost:4104/graphql" },
        { name: "wisdom", url: "http://localhost:4200/graphql" },
        { name: "voice", url: "http://localhost:4300/graphql" },
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

  // CORS for all routes
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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
  app.listen(PORT, () => {
    console.log(`🚀 Gateway running at http://localhost:${PORT}/graphql`)
  })
}
start()
