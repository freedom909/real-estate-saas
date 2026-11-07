//src/subgraphs/__tests__/audit/integration/audit.repository.integration.test.ts


import "reflect-metadata";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { AuditLogRepository } from "@/core/audit/infrastructure/repositories/auditLog.repository";
import { AuditLogModel } from "@/core/audit/domain/value-objects/audit-log.model";

describe("AuditLogRepository Integration", () => {
  let mongoServer: MongoMemoryServer;
  let repository: AuditLogRepository;

  const userId = new mongoose.Types.ObjectId().toString();

  const createTestLog = (overrides: Record<string, unknown> = {}) => ({
    userId,
    tenantId: "tenant-test-001",
    ownerId: "owner-test-001",
    action: "BOOKING_CREATED",
    resourceId: "booking-test-001",
    resourceType: "BOOKING" as const,
    status: "SUCCESS" as const,
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

    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);

    repository = new AuditLogRepository(AuditLogModel);
  });

  afterEach(async () => {
    await AuditLogModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it("should create an audit log in MongoDB", async () => {
    const result = await repository.create(createTestLog());

    expect(result.id).toBeDefined();
    expect(result.action).toBe("BOOKING_CREATED");
    expect(result.resourceType).toBe("BOOKING");
    expect(result.status).toBe("SUCCESS");
    expect(result.userId).toBe(userId);
  });

  it("should find audit logs by userId", async () => {
    await repository.create(createTestLog());

    const results = await repository.findByUserId(userId);

    expect(results).toHaveLength(1);
    expect(results[0].userId).toBe(userId);
  });

  it("should find audit logs by resource type and resource ID", async () => {
    await repository.create(createTestLog());

    const results = await repository.findByResource(
      "BOOKING",
      "booking-test-001"
    );

    expect(results).toHaveLength(1);
    expect(results[0].resourceId).toBe("booking-test-001");
    expect(results[0].resourceType).toBe("BOOKING");
  });

  it("should filter audit logs by status and resource type", async () => {
    await repository.create(createTestLog());

    await repository.create(
      createTestLog({
        action: "BOOKING_FAILED",
        resourceId: "booking-test-002",
        status: "FAILED",
      })
    );

    const results = await repository.findFiltered({
      status: "SUCCESS",
      resourceType: "BOOKING",
    });

    expect(results).toHaveLength(1);
    expect(results[0].status).toBe("SUCCESS");
  });

  it("should count filtered audit logs", async () => {
    await repository.create(createTestLog());

    await repository.create(
      createTestLog({
        action: "BOOKING_FAILED",
        resourceId: "booking-test-002",
        status: "FAILED",
      })
    );

    const count = await repository.countFiltered({
      userId,
    });

    expect(count).toBe(2);
  });

  it("should support pagination in findFiltered", async () => {
    await repository.create(createTestLog());

    const results = await repository.findFiltered(
      { userId },
      { limit: 1, skip: 0 }
    );

    expect(results).toHaveLength(1);
  });

  it("should return an empty array when no records match", async () => {
    const results = await repository.findFiltered({
      userId: new mongoose.Types.ObjectId().toString(),
    });

    expect(results).toHaveLength(0);
  });
});
