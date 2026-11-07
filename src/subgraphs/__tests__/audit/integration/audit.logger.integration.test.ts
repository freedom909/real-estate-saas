// src/subgraphs/__tests__/audit/integration/audit.logger.integration.test.ts


import "reflect-metadata";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { AuditLogger } from "@/core/audit/application/write/services/audit.logger";
import { AuditLogRepository } from "@/core/audit/infrastructure/repositories/auditLog.repository";
import { AuditLogModel } from "@/core/audit/domain/value-objects/audit-log.model";

describe("AuditLogger Integration", () => {
  let mongoServer: MongoMemoryServer;
  let repository: AuditLogRepository;
  let logger: AuditLogger;

  const userId = new mongoose.Types.ObjectId().toString();

  const createTestLog = () => ({
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
  });

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri());

    repository = new AuditLogRepository(AuditLogModel);
    logger = new AuditLogger(repository);
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

  it("should write an audit log through AuditLogger", async () => {
    const dto = createTestLog();

    const result = await logger.writeAuditLog(dto);

    expect(result.id).toBeDefined();
    expect(result.action).toBe("BOOKING_CREATED");
    expect(result.resourceType).toBe("BOOKING");
    expect(result.status).toBe("SUCCESS");
    expect(result.userId).toBe(userId);

    const savedLog = await AuditLogModel.findById(result.id).exec();

    expect(savedLog).not.toBeNull();
    expect(savedLog?.action).toBe("BOOKING_CREATED");
  });

  it("should preserve audit metadata when writing", async () => {
    const result = await logger.writeAuditLog(createTestLog());

    const savedLog = await AuditLogModel.findById(result.id).exec();

    expect(savedLog?.meta?.deviceId).toBe("device-test-001");
    expect(savedLog?.meta?.provider).toBe("web");
    expect(savedLog?.meta?.ip).toBe("127.0.0.1");
  });

  it("should persist request and correlation IDs", async () => {
    const result = await logger.writeAuditLog(createTestLog());

    const savedLog = await AuditLogModel.findById(result.id).exec();

    expect(savedLog?.requestId).toBe("request-test-001");
    expect(savedLog?.correlationId).toBe("correlation-test-001");
  });
});
