import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import path from 'path';
import gql from 'graphql-tag';
import mongoose from 'mongoose';

import { resolvers } from './resolvers/audit.resolver';
import { registerDependencies } from './container/registerDependencies';

async function bootstrap() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/audit-db');

  registerDependencies();

  const typeDefs = gql(
    readFileSync(path.resolve(__dirname, 'schema.graphql'), { encoding: 'utf-8' })
  );

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4004 },
  });
  console.log(`Audit Subgraph ready at ${url}`);
}

bootstrap();