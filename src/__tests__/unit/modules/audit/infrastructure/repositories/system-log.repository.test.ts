/**
 * Unit tests for SystemLogRepository.
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { SystemLogRepository } from "@/core/audit/infrastructure/repositories/system-log.repository";




describe("SystemLogRepository", () => {
  let repo: SystemLogRepository;
  let mockModel: any;

  const RAW_DOC = {
    _id: "907f1f77bcf86cd7994390cd",
    level: "ERROR",
    type: "EXCEPTION",
    service: "auth-subgraph",
    module: "auth/login",
    action: "OAuthLogin",
    message: "Token expired",
    correlationId: "cor-abc",
    requestId: "req-abc",
    meta: { provider: "google" },
    latencyMs: 120,
    stack: "Error: at index.js:42",
    createdAt: new Date("2024-02-01T00:00:00Z"),
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
    repo = new (SystemLogRepository as any)(mockModel);
  });

  describe("create", () => {
    it("saves and maps the raw doc to the domain", async () => {
      mockModel.create.mockResolvedValue(RAW_DOC);

      const result = await repo.create({
        level: "ERROR",
        message: "Token expired",
      });

      expect(mockModel.create).toHaveBeenCalledWith({
        level: "ERROR",
        message: "Token expired",
      });
      expect(result).toStrictEqual({
        id: RAW_DOC._id.toString(),
        level: "ERROR",
        type: "EXCEPTION",
        service: "auth-subgraph",
        module: "auth/login",
        action: "OAuthLogin",
        message: "Token expired",
        correlationId: "cor-abc",
        requestId: "req-abc",
        meta: { provider: "google" },
        latencyMs: 120,
        stack: "Error: at index.js:42",
        createdAt: RAW_DOC.createdAt,
      });
    });

    it("propagates errors", async () => {
      mockModel.create.mockRejectedValue(new Error("level invalid"));
      await expect(repo.create({ level: "BAD" } as any)).rejects.toThrow(
        "level invalid"
      );
    });
  });

  describe("findById", () => {
    it("returns the domain object when found", async () => {
      mockModel.findById.mockReturnValue(createExecMock(RAW_DOC));
      const result = await repo.findById(RAW_DOC._id);
      expect(result?.id).toBe(RAW_DOC._id.toString());
      expect(result?.level).toBe("ERROR");
    });

    it("returns null when missing", async () => {
      mockModel.findById.mockReturnValue(createExecMock(null));
      const result = await repo.findById("missing");
      expect(result).toBeNull();
    });
  });

  describe("find", () => {
    it("uses defaults and returns mapped results", async () => {
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock([RAW_DOC, RAW_DOC]));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      const result = await repo.find({ level: "ERROR" });

      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skip).toHaveBeenCalledWith(0);
      expect(limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(RAW_DOC._id.toString());
    });

    it("applies explicit limit/skip/sort", async () => {
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock([]));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      await repo.find({}, { limit: 1, skip: 2, sort: { latencyMs: -1 } });

      expect(sort).toHaveBeenCalledWith({ latencyMs: -1 });
      expect(skip).toHaveBeenCalledWith(2);
      expect(limit).toHaveBeenCalledWith(1);
    });
  });

  describe("count", () => {
    it("counts docs by filter", async () => {
      mockModel.countDocuments.mockReturnValue(createExecMock(100));
      const result = await repo.count({ service: "auth-subgraph" });
      expect(mockModel.countDocuments).toHaveBeenCalledWith({ service: "auth-subgraph" });
      expect(result).toBe(100);
    });
  });

  describe("toDomain edge cases", () => {
    it("passes meta through unchanged", async () => {
      const withMeta = {
        ...RAW_DOC,
        meta: { a: 1, b: { c: 2 }, timestamp: 123 },
      };
      mockModel.create.mockResolvedValue(withMeta);
      const result = await repo.create({} as any);
      expect(result.meta).toEqual(withMeta.meta);
    });

    it("sets createdAt to doc createdAt", async () => {
      const t = new Date("2020-01-01");
      mockModel.create.mockResolvedValue({ ...RAW_DOC, createdAt: t });
      const result = await repo.create({} as any);
      expect(result.createdAt).toBe(t);
    });
  });
});
