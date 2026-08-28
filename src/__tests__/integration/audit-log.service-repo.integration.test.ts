/**
 * Integration test for the audit-log service layer interacting with the
 * audit-log repository.
 *
 * Scope:
 *   AuditLogService (write path)  →  IAuditLogRepository  →  AuditLogRepository
 *
 * The real AuditLogRepository is used (no class-level mocking), but the
 * Mongoose Model layer is faked so this runs in-process without a DB.
 *
 * Run: npx jest src/__tests__/integration/audit-log.service-repo.integration.test.ts --no-cache
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AuditLogService } from "@/modules/audit/application/write/services/audit-log.service";
import { AuditLogRepository } from "@/modules/audit/infrastructure/repositories/audit-log.repository";
import { CreateAuditLogDTO } from "@/modules/audit/application/write/dto/create-audit-log.dto";

describe("AuditLogService + AuditLogRepository (integration)", () => {
  let mockModel: any;
  let repo: AuditLogRepository;
  let service: AuditLogService;

  const createExecMock = <T,>(result: T) => ({
    exec: jest.fn<Promise<T>>().mockResolvedValue(result),
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };

    repo = new (AuditLogRepository as any)(mockModel);
    service = new (AuditLogService as any)(repo);
  });

  describe("writeAuditLog → repository.create", () => {
    it("passes DTO through service → repository.create → returns mapped domain object", async () => {
      const rawDoc = {
        _id: "507f1f77bcf86cd799439011",
        userId: "607f1f77bcf86cd7994390ff",
        tenantId: "tenant-acme",
        ownerId: "owner-1",
        action: "CREATE_BOOKING",
        resourceId: "booking-abc",
        resourceType: "BOOKING",
        status: "SUCCESS",
        requestId: "req-1",
        correlationId: "cor-1",
        meta: { ip: "127.0.0.1", userAgent: "mozilla" },
        createdAt: new Date("2024-06-01T00:00:00Z"),
      };
      mockModel.create.mockResolvedValue(rawDoc);

      const dto: CreateAuditLogDTO = {
        userId: "607f1f77bcf86cd7994390ff",
        tenantId: "tenant-acme",
        ownerId: "owner-1",
        action: "CREATE_BOOKING",
        resourceId: "booking-abc",
        resourceType: "BOOKING",
        status: "SUCCESS",
        requestId: "req-1",
        correlationId: "cor-1",
        meta: { ip: "127.0.0.1", userAgent: "mozilla" },
      };

      const result = await service.writeAuditLog(dto);

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.create.mock.calls[0][0]).toMatchObject({
        action: "CREATE_BOOKING",
        resourceId: "booking-abc",
        resourceType: "BOOKING",
      });

      expect(result).toStrictEqual({
        id: rawDoc._id.toString(),
        userId: rawDoc.userId.toString(),
        tenantId: rawDoc.tenantId,
        ownerId: rawDoc.ownerId,
        action: rawDoc.action,
        resourceId: rawDoc.resourceId,
        resourceType: rawDoc.resourceType,
        status: rawDoc.status,
        requestId: rawDoc.requestId,
        correlationId: rawDoc.correlationId,
        meta: rawDoc.meta,
        createdAt: rawDoc.createdAt,
      });
    });

    it("surfaces repository errors to the caller", async () => {
      mockModel.create.mockRejectedValue(
        new Error("MongoServerError: E11000 duplicate key")
      );

      const dto: CreateAuditLogDTO = {
        action: "LOGIN",
        resourceId: "auth",
        resourceType: "AUTH",
        status: "SUCCESS",
      };

      await expect(service.writeAuditLog(dto)).rejects.toThrow(
        "MongoServerError: E11000 duplicate key"
      );
    });

    it("works when DTO has minimal fields (optional fields omitted)", async () => {
      const rawDoc = {
        _id: "507f1f77bcf86cd799439011",
        action: "LOGIN",
        resourceId: "auth",
        resourceType: "AUTH",
        status: "SUCCESS",
        createdAt: new Date("2024-06-02"),
      };
      mockModel.create.mockResolvedValue(rawDoc);

      const dto: CreateAuditLogDTO = {
        action: "LOGIN",
        resourceId: "auth",
        resourceType: "AUTH",
        status: "SUCCESS",
      };

      const result = await service.writeAuditLog(dto);

      expect(result.action).toBe("LOGIN");
      expect(result.userId).toBeUndefined();
      expect(result.tenantId).toBeUndefined();
      expect(result.ownerId).toBeUndefined();
      expect(result.requestId).toBeUndefined();
      expect(result.correlationId).toBeUndefined();
      expect(result.meta).toBeUndefined();
      expect(result.id).toBe(rawDoc._id.toString());
    });
  });

  describe("find + count workflow (service-through-repository read path)", () => {
    it("service consumer can read back the created log via the repo", async () => {
      const created = {
        _id: "bbbb1f77bcf86cd7994390cd",
        userId: "aaaa1f77bcf86cd7994390ff",
        tenantId: "tenant-x",
        action: "LOGIN",
        resourceId: "auth",
        resourceType: "AUTH",
        status: "SUCCESS",
        createdAt: new Date(),
      };
      mockModel.create.mockResolvedValue(created);
      mockModel.findById.mockReturnValue(createExecMock(created));
      mockModel.countDocuments.mockReturnValue(createExecMock(1));

      const dto: CreateAuditLogDTO = {
        action: "LOGIN",
        resourceId: "auth",
        resourceType: "AUTH",
        status: "SUCCESS",
      };

      const saved = await service.writeAuditLog(dto);
      const fetched = await repo.findById(saved.id);
      const count = await repo.count({ "meta.correlationId": "anything" });

      expect(saved.id).toBe(created._id.toString());
      expect(fetched?.id).toBe(created._id.toString());
      expect(count).toBe(1);
    });
  });
});
