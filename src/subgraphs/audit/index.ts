import 'reflect-metadata';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { readFileSync } from 'fs';
import path from 'path';
import gql from 'graphql-tag';
import mongoose from 'mongoose';

import { resolvers } from './resolvers/audit.resolver';
import registerDependencies from './container/registerDependencies';
import { container } from 'tsyringe';

async function bootstrap() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/east');

  registerDependencies(container);

const typeDefs = gql(
  readFileSync(
    "./src/subgraphs/audit/schema/schema.graphql",
    "utf-8"
  )
);

  const server = new ApolloServer({
    schema: buildSubgraphSchema({ typeDefs, resolvers }),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT) || 4080 },
  });
  console.log(`Audit Subgraph ready at ${url}`);
}

bootstrap();