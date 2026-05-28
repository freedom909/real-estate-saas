// gateway/index.js (nodemon restart trigger)
import './config.js'; // Import and execute dotenv config first
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServer } from '@apollo/server';
import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from "cookie-parser";
import { expressMiddleware } from '@as-integrations/express5';
import fileRouter from "./routes/fileRouter.js";
import accountRouterFactory from "./routes/accountRouter.js";
import initializeAccountContainer from "../services/DB/initAccountContainer.js";

const gateway = new ApolloGateway({

  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: 'accounts', url: process.env.ACCOUNTS_SUBGRAPH_URL || 'http://localhost:4020/graphql' },
      { name: 'admin', url: process.env.ADMIN_SUBGRAPH_URL || 'http://localhost:4150/graphql' },
      // { name: 'profiles', url: process.env.PROFILES_SUBGRAPH_URL || 'http://localhost:4030/graphql' },
      { name: 'users', url: process.env.USERS_SUBGRAPH_URL || 'http://localhost:4010/graphql' },
      // { name: 'listings', url: 'http://localhost:4040/graphql' },
      // { name: 'carts', url: process.env.CARTS_SUBGRAPH_URL || 'http://localhost:4060/graphql' },
      // { name: 'bookings', url: 'http://localhost:4050/graphql' },
      // { name: 'reviews', url: 'http://localhost:4080/graphql' },
      // { name: 'amenities', url: 'http://localhost:4090/graphql' },
      // { name: 'locations', url: process.env.LOCATIONS_SUBGRAPH_URL || 'http://localhost:4140/graphql' },
      // { name: 'aiService', url: 'http://localhost:4100/graphql' },
      // { name: 'orders', url: process.env.ORDERS_SUBGRAPH_URL || 'http://localhost:4110/graphql' },
      // { name: 'payments', url: 'http://localhost:4070/graphql' }
    ],
    // Add configuration to handle introspection better
    introspectionHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    pollIntervalInMs: 10000 // Poll every 10 seconds for schema changes
  })
});

async function startGateway() {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({ gateway, subscriptions: false, introspection: true, context: async ({ req }) => ({ req }) });

  await server.start();

  // Define a whitelist of allowed origins
  const whitelist = [
    "http://localhost:3000",
    "http://172.18.160.1:3000", // Your local network IP
  ];

  // CORS first
app.use(cors({
  origin: whitelist,
  credentials: true,
  exposedHeaders: ["Set-Cookie"]
}));


  app.use(cookieParser()); 
  app.use(express.json());

  // Initialize DI container for REST routes
  const container = await initializeAccountContainer();

  // Admin REST API (uses dependency injection)
  const accountRouter = accountRouterFactory(container);
  app.use("/admin", accountRouter);
  app.use("/file", fileRouter);
console.log("fileRouter loaded from:", import.meta.url);
  // GraphQL middleware for Gateway
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  }));
    httpServer.listen(4000, () => {
    console.log(`🚀 Gateway running at http://localhost:4000/graphql`);
    console.log(`📄 Presign API at http://localhost:4000/file/presign-url`);// Cannot GET /file/presign-url
  });
}

startGateway();