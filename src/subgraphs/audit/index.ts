import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import express from 'express';
import http from 'http';
import cors from 'cors';

import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import dns from 'dns';

import gql from 'graphql-tag';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

import { resolvers } from './resolvers/audit.resolver';
import { container } from 'tsyringe';
import registerAuditDependencies from '@/modules/container/audit.register';
import { registerEventBus } from '@/modules/container/event.bus.register';
import { AuditConsumer } from '@/MQ/consumer/audit.consumer';

import { verifyInternalServiceRequest } from '@/infrastructure/auth/verifyInternalServiceRequest';
import { expressMiddleware } from '@as-integrations/express4';

dns.setServers(["8.8.8.8", "1.1.1.1"]);
// â”€â”€ 1. Module-level DI registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
registerAuditDependencies(container);

async function bootstrap() {

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nakano');//
 
  registerAuditDependencies(container);
  registerEventBus();

  // Start the audit consumer to listen for audit events
  container.resolve(AuditConsumer);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/audit/schema/schema.graphql",
    "utf-8"
  )
);


  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  await server.start();

  const app = express();
  const httpServer = http.createServer(app);

  app.use(
    '/graphql',
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
    verifyInternalServiceRequest,
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        req,
        res,
        container,
      }),
    }),
  );

  const port = Number(process.env.PORT) || 4070;

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Audit Subgraph running on port ${port}`);
  });
}
bootstrap()
