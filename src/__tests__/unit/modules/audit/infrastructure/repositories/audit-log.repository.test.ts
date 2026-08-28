/**
 * Unit tests for AuditLogRepository.
 *
 * Tests the 4 public operations (create, findById, find, count) and the
 * private toDomain() mapping behavior by observing the repository outputs
 * given a controlled mock Mongoose model.
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AuditLogRepository } from "@/modules/audit/infrastructure/repositories/audit-log.repository";

describe("AuditLogRepository", () => {
  let repo: AuditLogRepository;
  let mockModel: any;

  const RAW_DOC = {
    _id: "507f1f77bcf86cd799439011",
    userId: "607f1f77bcf86cd7994390ff",
    tenantId: "tenant-acme",
    ownerId: "owner-1",
    action: "LOGIN",
    resourceId: "res-abc",
    resourceType: "AUTH",
    status: "SUCCESS",
    requestId: "req-1",
    correlationId: "cor-1",
    meta: { ip: "127.0.0.1" },
    createdAt: new Date("2024-01-01T00:00:00Z"),
  };

  function createExecMock<T>(result: T): { exec: jest.Mock<Promise<T>> } {
    return { exec: jest.fn<Promise<T>>().mockResolvedValue(result) };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = {
      create: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    repo = new (AuditLogRepository as any)(mockModel);
  });

  // ── create ──────────────────────────────────────────────────────────────

  describe("create", () => {
    it("saves a partial and returns a domain-mapped object", async () => {
      mockModel.create.mockResolvedValue(RAW_DOC);

      const result = await repo.create({
        action: "LOGIN",
        resourceId: "res-abc",
        resourceType: "AUTH",
        status: "SUCCESS",
      });

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.create.mock.calls[0][0]).toMatchObject({
        action: "LOGIN",
        resourceType: "AUTH",
      });
      expect(result).toStrictEqual({
        id: RAW_DOC._id.toString(),
        userId: RAW_DOC.userId.toString(),
        tenantId: RAW_DOC.tenantId,
        ownerId: RAW_DOC.ownerId,
        action: RAW_DOC.action,
        resourceId: RAW_DOC.resourceId,
        resourceType: RAW_DOC.resourceType,
        status: RAW_DOC.status,
        requestId: RAW_DOC.requestId,
        correlationId: RAW_DOC.correlationId,
        meta: RAW_DOC.meta,
        createdAt: RAW_DOC.createdAt,
      });
    });

    it("maps userId to string even when userId is undefined on the doc", async () => {
      const rawWithoutUser = { ...RAW_DOC, userId: undefined };
      mockModel.create.mockResolvedValue(rawWithoutUser);

      const result = await repo.create({
        action: "LOGOUT",
        resourceId: "r",
        resourceType: "AUTH",
        status: "SUCCESS",
      });

      expect(result.userId).toBeUndefined();
      expect(result.id).toBe(RAW_DOC._id);
    });

    it("propagates model errors", async () => {
      mockModel.create.mockRejectedValue(new Error("DB unavailable"));

      await expect(
        repo.create({ action: "X", resourceId: "x", resourceType: "AUTH", status: "SUCCESS" })
      ).rejects.toThrow("DB unavailable");
    });
  });

  // ── findById ────────────────────────────────────────────────────────────

  describe("findById", () => {
    it("returns the domain object when doc exists", async () => {
      mockModel.findById.mockReturnValue(createExecMock(RAW_DOC));

      const result = await repo.findById(RAW_DOC._id);

      expect(mockModel.findById).toHaveBeenCalledWith(RAW_DOC._id);
      expect(result?.id).toBe(RAW_DOC._id.toString());
      expect(result?.action).toBe("LOGIN");
    });

    it("returns null when doc does not exist", async () => {
      mockModel.findById.mockReturnValue(createExecMock(null));

      const result = await repo.findById("does-not-exist");

      expect(result).toBeNull();
    });
  });

  // ── find ────────────────────────────────────────────────────────────────

  describe("find", () => {
    it("applies default pagination when no options are provided", async () => {
      const docs = [RAW_DOC, { ...RAW_DOC, _id: "aa" }];
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock(docs));
      const find = jest.fn().mockReturnValue({ sort, skip, limit });
      mockModel.find = find;

      const result = await repo.find({ tenantId: "tenant-acme" });

      expect(find).toHaveBeenCalledWith({ tenantId: "tenant-acme" });
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skip).toHaveBeenCalledWith(0);
      expect(limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(RAW_DOC._id.toString());
    });

    it("respects explicit limit, skip, sort", async () => {
      const docs = [RAW_DOC];
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock(docs));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      await repo.find(
        { action: "LOGIN" },
        { limit: 10, skip: 20, sort: { tenantId: 1 } }
      );

      expect(sort).toHaveBeenCalledWith({ tenantId: 1 });
      expect(skip).toHaveBeenCalledWith(20);
      expect(limit).toHaveBeenCalledWith(10);
    });

    it("returns empty array when no docs match", async () => {
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock([]));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      const result = await repo.find({ action: "NEVER" });

      expect(result).toEqual([]);
    });
  });

  // ── count ───────────────────────────────────────────────────────────────

  describe("count", () => {
    it("returns the document count for the filter", async () => {
      mockModel.countDocuments.mockReturnValue(createExecMock(42));

      const result = await repo.count({ tenantId: "tenant-acme" });

      expect(mockModel.countDocuments).toHaveBeenCalledWith({ tenantId: "tenant-acme" });
      expect(result).toBe(42);
    });

    it("returns 0 when no docs match", async () => {
      mockModel.countDocuments.mockReturnValue(createExecMock(0));

      const result = await repo.count({ action: "MISSING" });

      expect(result).toBe(0);
    });
  });

  // ── toDomain edge cases ─────────────────────────────────────────────────

  describe("toDomain edge cases", () => {
    it("converts userId ObjectId to string via toString()", async () => {
      const fakeObjectId = { toString: () => "converted-id" };
      const raw = { ...RAW_DOC, userId: fakeObjectId };
      mockModel.create.mockResolvedValue(raw);

      const result = await repo.create({ action: "X", resourceId: "x", resourceType: "AUTH", status: "PENDING" });

      expect(result.userId).toBe("converted-id");
    });

    it("preserves meta and nested fields exactly", async () => {
      const rawWithFullMeta = {
        ...RAW_DOC,
        meta: { ip: "10.0.0.1", userAgent: "ua", deviceId: "d1", provider: "google", reason: "ok" },
      };
      mockModel.create.mockResolvedValue(rawWithFullMeta);

      const result = await repo.create({ action: "X", resourceId: "x", resourceType: "AUTH", status: "SUCCESS" });

      expect(result.meta).toEqual(rawWithFullMeta.meta);
    });
  });
});
