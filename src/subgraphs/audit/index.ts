import "reflect-metadata";

import path from "path";
import { fileURLToPath } from "url";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import mongoose from "mongoose";

import { resolvers } from "./resolvers/audit.resolver";
import registerAuditDependencies from "@/modules/container/audit.register";

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

async function bootstrap() {
  await mongoose.connect(
    process.env.MONGO_URI ??
      "mongodb://localhost:27017/kakawa"
  );

  registerAuditDependencies();

  const typeDefs = gql(
    readFileSync(
      path.join(
        __dirname,
        "schema",
        "schema.graphql"
      ),
      "utf8"
    )
  );

  const server =
    new ApolloServer({
      schema:
        buildSubgraphSchema({
          typeDefs,
          resolvers,
        }),
    });

  const { url } =
    await startStandaloneServer(
      server,
      {
        listen: {
          port:
            Number(
              process.env.PORT
            ) || 4070,
        },

        context:
          async ({ req }) => ({
            req,

            user: {
              id: "dev-user",
              role: "ADMIN",
            },
          }),
      }
    );

  console.log(
    `🚀 Audit Subgraph ready at ${url}`
  );
}

bootstrap();