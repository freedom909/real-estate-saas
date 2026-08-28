/**
 * Unit tests for DecisionLogRepository.
 */
import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { DecisionLogRepository } from "@/modules/audit/infrastructure/repositories/decision-log.repository";

describe("DecisionLogRepository", () => {
  let repo: DecisionLogRepository;
  let mockModel: any;

  const RAW_DOC = {
    _id: "707f1f77bcf86cd7994390ab",
    meta: {
      executionId: "exec-1",
      correlationId: "cor-1",
      requestId: "req-1",
      sessionId: "ses-1",
    },
    actor: {
      userId: "607f1f77bcf86cd7994390ff",
      tenantId: "tenant-acme",
      ownerId: "owner-1",
      role: "ADMIN",
    },
    input: {
      rawMessage: "Hello",
      source: "CHAT",
      locale: "ja-JP",
    },
    decision: {
      status: "APPROVED",
      approved: true,
      confidence: 0.95,
      reason: "Looks good",
      riskLevel: "LOW",
      requiresHumanReview: false,
    },
    createdAt: new Date("2024-01-02T00:00:00Z"),
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
    repo = new (DecisionLogRepository as any)(mockModel);
  });

  describe("create", () => {
    it("creates and returns a deep-mapped domain object", async () => {
      mockModel.create.mockResolvedValue(RAW_DOC);

      const result = await repo.create({ decision: { status: "PENDING" } });

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        id: RAW_DOC._id.toString(),
        meta: { ...RAW_DOC.meta },
        actor: {
          ...RAW_DOC.actor,
          userId: RAW_DOC.actor.userId.toString(),
        },
        input: { ...RAW_DOC.input },
        decision: { ...RAW_DOC.decision },
        createdAt: RAW_DOC.createdAt,
      });
    });

    it("propagates errors", async () => {
      mockModel.create.mockRejectedValue(new Error("validation failed"));
      await expect(repo.create({} as any)).rejects.toThrow("validation failed");
    });
  });

  describe("findById", () => {
    it("returns the domain object when found", async () => {
      mockModel.findById.mockReturnValue(createExecMock(RAW_DOC));
      const result = await repo.findById(RAW_DOC._id);
      expect(result?.id).toBe(RAW_DOC._id.toString());
      expect(result?.decision.status).toBe("APPROVED");
    });

    it("returns null when not found", async () => {
      mockModel.findById.mockReturnValue(createExecMock(null));
      const result = await repo.findById("nope");
      expect(result).toBeNull();
    });
  });

  describe("find", () => {
    it("applies defaults (limit=50, skip=0, createdAt:-1)", async () => {
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock([RAW_DOC]));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      const result = await repo.find({ "meta.correlationId": "cor-1" });

      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skip).toHaveBeenCalledWith(0);
      expect(limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(1);
    });

    it("applies explicit options", async () => {
      const sort = jest.fn().mockReturnThis();
      const skip = jest.fn().mockReturnThis();
      const limit = jest.fn().mockReturnValue(createExecMock([]));
      mockModel.find = jest.fn().mockReturnValue({ sort, skip, limit });

      await repo.find({}, { limit: 5, skip: 10, sort: { "decision.riskLevel": 1 } });

      expect(sort).toHaveBeenCalledWith({ "decision.riskLevel": 1 });
      expect(skip).toHaveBeenCalledWith(10);
      expect(limit).toHaveBeenCalledWith(5);
    });
  });

  describe("count", () => {
    it("returns count", async () => {
      mockModel.countDocuments.mockReturnValue(createExecMock(7));
      const result = await repo.count({ "decision.riskLevel": "HIGH" });
      expect(result).toBe(7);
    });
  });

  describe("toDomain edge cases", () => {
    it("converts actor.userId to string even when userId is a fake ObjectId", async () => {
      const fakeOid = { toString: () => "converted" };
      const raw = { ...RAW_DOC, actor: { ...RAW_DOC.actor, userId: fakeOid } };
      mockModel.create.mockResolvedValue(raw);
      const result = await repo.create({ decision: { status: "X" } } as any);
      expect(result.actor.userId).toBe("converted");
    });

    it("preserves deep decision object with all fields", async () => {
      mockModel.create.mockResolvedValue(RAW_DOC);
      const result = await repo.create({ decision: { status: "X" } } as any);
      expect(result.decision).toStrictEqual(RAW_DOC.decision);
      expect(result.decision.requiresHumanReview).toBe(false);
    });
  });
});
