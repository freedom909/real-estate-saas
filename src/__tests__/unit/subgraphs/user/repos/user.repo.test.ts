import "reflect-metadata";
import UserRepo from "../../../../../subgraphs/user/repos/user.repo";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

function createMockLeanQuery(returnValue: any) {
  return {
    lean: jest.fn(() => Promise.resolve(returnValue)),
  };
}

describe("UserRepo", () => {
  let repo: UserRepo;
  let mockModel: any;
  const mockRedis = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };
    repo = new UserRepo(mockModel, mockRedis);
  });

  describe("userByEmail", () => {
    it("should find user by email with lean query", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      const leanQuery = createMockLeanQuery(mockUser);
      mockModel.findOne.mockReturnValue(leanQuery);

      const result = await repo.userByEmail("test@example.com");

      expect(mockModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(leanQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      const leanQuery = createMockLeanQuery(null);
      mockModel.findOne.mockReturnValue(leanQuery);

      const result = await repo.userByEmail("missing@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find user by ID with lean query", async () => {
      const mockUser = { _id: "123", email: "test@example.com" };
      const leanQuery = createMockLeanQuery(mockUser);
      mockModel.findById.mockReturnValue(leanQuery);

      const result = await repo.findById("123");

      expect(mockModel.findById).toHaveBeenCalledWith("123");
      expect(leanQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      const leanQuery = createMockLeanQuery(null);
      mockModel.findById.mockReturnValue(leanQuery);

      const result = await repo.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return new user", async () => {
      const input = { email: "new@example.com", name: "New User" };
      const createdUser = { _id: "456", ...input };
      mockModel.create.mockResolvedValue(createdUser);

      const result = await repo.create(input);

      expect(mockModel.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(createdUser);
    });

    it("should propagate creation errors", async () => {
      const error = new Error("Validation failed");
      mockModel.create.mockRejectedValue(error);

      await expect(repo.create({ email: "bad" })).rejects.toThrow("Validation failed");
    });
  });

  describe("deactivate", () => {
    it("should set user status to INACTIVE", async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await repo.deactivate("user-123");

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("user-123", { status: "INACTIVE" });
    });
  });

  describe("update", () => {
    it("should update user and return updated document", async () => {
      const updatedUser = { _id: "123", name: "Updated Name" };
      const leanQuery = createMockLeanQuery(updatedUser);
      mockModel.findByIdAndUpdate.mockReturnValue(leanQuery);

      const result = await repo.update("123", { name: "Updated Name" });

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("123", { name: "Updated Name" }, { new: true });
      expect(leanQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it("should return null when user not found", async () => {
      const leanQuery = createMockLeanQuery(null);
      mockModel.findByIdAndUpdate.mockReturnValue(leanQuery);

      const result = await repo.update("nonexistent", { name: "Test" });

      expect(result).toBeNull();
    });
  });

  describe("updateLastLogin", () => {
    it("should update lastLoginAt timestamp", async () => {
      mockModel.updateOne.mockResolvedValue({});

      await repo.updateLastLogin("user-123", new Date());

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: "user-123" },
        { lastLoginAt: expect.any(Date) }
      );
    });
  });
});
