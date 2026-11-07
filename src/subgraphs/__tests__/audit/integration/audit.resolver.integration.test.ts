//src/subgraphs/__tests__/audit/integration/audit.resolver.integration.test.ts


import "reflect-metadata";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";
import { readFileSync } from "fs";

import { container } from "tsyringe";

import { resolvers } from "@/subgraphs/audit/resolvers/audit.resolver";
import { AuditLogModel } from "@/core/audit/domain/value-objects/audit-log.model";
import registerAuditDependencies from "@/modules/container/audit.register";

describe("Audit GraphQL Resolver Integration", () => {
  let mongoServer: MongoMemoryServer;
  let server: ApolloServer;

  const userId = new mongoose.Types.ObjectId().toString();
  
  interface RecordAuditLogResult {
  id: string;
  userId: string | null;
  tenantId: string | null;
  action: string;
  resourceId: string;
  resourceType: string;
  status: string;
  requestId: string | null;
  correlationId: string | null;
  meta: {
    deviceId: string | null;
    provider: string | null;
    ip: string | null;
    userAgent: string | null;
  } | null;
}

  const mutation = `
    mutation RecordAuditLog($input: RecordAuditLogInput!) {
      recordAuditLog(input: $input) {
        id
        userId
        tenantId
        action
        resourceId
        resourceType
        status
        requestId
        correlationId
        meta {
          deviceId
          provider
          ip
          userAgent
        }
      }
    }
  `;

  const query = `
    query GetAuditLogs($filter: AuditLogFilterInput) {
      getAuditLogs(filter: $filter) {
        id
        userId
        tenantId
        action
        resourceId
        resourceType
        status
        requestId
        correlationId
        meta {
          deviceId
          provider
          ip
          userAgent
        }
      }
    }
  `;

  const createInput = (overrides: Record<string, unknown> = {}) => ({
    userId,
    tenantId: "tenant-test-001",
    ownerId: "owner-test-001",
    action: "BOOKING_CREATED",
    resourceId: "booking-test-001",
    resourceType: "BOOKING",
    status: "SUCCESS",
    requestId: "request-test-001",
    correlationId: "correlation-test-001",
    meta: {
      deviceId: "device-test-001",
      provider: "web",
      ip: "127.0.0.1",
      userAgent: "Integration Test",
    },
    ...overrides,
  });

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());

    // Register the actual Audit dependencies in the global container.
    registerAuditDependencies(container);

    const typeDefs = gql(
      readFileSync(
        "src/subgraphs/audit/schema/schema.graphql",
        "utf-8"
      )
    );

    server = new ApolloServer({
      schema: buildSubgraphSchema({
        typeDefs,
        resolvers,
      }),
    });

    await server.start();
  });

  afterEach(async () => {
    await AuditLogModel.deleteMany({});
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }

    container.reset();

    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should create an audit log through GraphQL Mutation", async () => {
    const response = await server.executeOperation({
      query: mutation,
      variables: {
        input: createInput(),
      },
    });

    expect(response.body.kind).toBe("single");

    if (response.body.kind !== "single") {
      throw new Error("Expected a single GraphQL response");
    }

    expect(response.body.singleResult.errors).toBeUndefined();

    const result= response.body.singleResult.data?.recordAuditLog as RecordAuditLogResult;

    expect(result.id).toBeDefined();
    expect(result.action).toBe("BOOKING_CREATED");
    expect(result.resourceType).toBe("BOOKING");
    expect(result.status).toBe("SUCCESS");
    expect(result.userId).toBe(userId);

    const savedLog = await AuditLogModel.findById(result.id).exec();

    expect(savedLog).not.toBeNull();
    expect(savedLog?.action).toBe("BOOKING_CREATED");
  });

  it("should retrieve audit logs through GraphQL Query", async () => {
    const createResponse = await server.executeOperation({
      query: mutation,
      variables: {
        input: createInput(),
      },
    });

    expect(createResponse.body.kind).toBe("single");

    if (createResponse.body.kind !== "single") {
      throw new Error("Expected a single GraphQL response");
    }

    expect(createResponse.body.singleResult.errors).toBeUndefined();

    const response = await server.executeOperation({
      query,
      variables: {
        filter: {
          userId,
        },
      },
    });

    expect(response.body.kind).toBe("single");

    if (response.body.kind !== "single") {
      throw new Error("Expected a single GraphQL response");
    }

    expect(response.body.singleResult.errors).toBeUndefined();

    const results = response.body.singleResult.data?.getAuditLogs;

    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe(userId);
    expect(results[0].action).toBe("BOOKING_CREATED");
  });

  it("should return an empty array when no audit logs match", async () => {
    const response = await server.executeOperation({
      query,
      variables: {
        filter: {
          userId: new mongoose.Types.ObjectId().toString(),
        },
      },
    });

    expect(response.body.kind).toBe("single");

    if (response.body.kind !== "single") {
      throw new Error("Expected a single GraphQL response");
    }

    expect(response.body.singleResult.errors).toBeUndefined();

    expect(
      response.body.singleResult.data?.getAuditLogs
    ).toHaveLength(0);
  });

  it("should reject a Mutation missing required fields", async () => {
    const response = await server.executeOperation({
      query: mutation,
      variables: {
        input: {
          action: "BOOKING_CREATED",
        },
      },
    });

    expect(response.body.kind).toBe("single");

    if (response.body.kind !== "single") {
      throw new Error("Expected a single GraphQL response");
    }

    expect(response.body.singleResult.errors).toBeDefined();
  });
});
