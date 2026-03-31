// src/subgraphs/audit/__tests__/harness/audit.harness.ts

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { gql } from "graphql-tag";
import { container } from "tsyringe";
import  {resolvers}  from "../../../audit/resolvers/audit.resolver";
import  registerAuditDependencies  from "../../../audit/container/registerDependencies";
import { readFileSync } from "fs";
import { printSchema } from "graphql";
import { generateTests } from "../ai/generator";

export class AuditHarness {
  private server!: ApolloServer;

  async init() {
    // 1. 注册依赖（关键）
    registerAuditDependencies(container);
   const typeDefs = gql(
     readFileSync("./src/subgraphs/audit/schema/schema.graphql", "utf-8")
   )

    // 2. 创建 subgraph schema
    const schema = buildSubgraphSchema([
      {
        typeDefs,
        resolvers,
      },
    ]);
const schemaSDL = printSchema(schema);
console.log(schemaSDL);

    // 3. 创建 Apollo Server
    this.server = new ApolloServer({
      schema,
    });

    await this.server.start();
  }

  async execute(query: string, variables = {}, context = {}) {
    return this.server.executeOperation(
      {
        query,
        variables,
      },
      {
        contextValue: context,
      }
    );
  }

  async close() {
    await this.server.stop();
  }
}