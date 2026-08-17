import "reflect-metadata";
import { UserRepository } from "../../../../../subgraphs/user/infra/repos/user.repo";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe("UserRepository", () => {
  let repo: UserRepository;
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    };
    repo = new (UserRepository as any)(mockModel);
  });

  describe("findByEmail", () => {
    it("should find user by email", async () => {
      const mockRaw = { _id: "123", email: "test@example.com", name: "Test" };
      mockModel.findOne.mockResolvedValue(mockRaw);

      const result = await repo.findByEmail("test@example.com");

      expect(mockModel.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(result).toBeDefined();
    });

    it("should return null when user not found", async () => {
      mockModel.findOne.mockResolvedValue(null);

      const result = await repo.findByEmail("missing@example.com");

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find user by ID", async () => {
      const mockRaw = { _id: "123", email: "test@example.com", name: "Test" };
      mockModel.findById.mockResolvedValue(mockRaw);

      const result = await repo.findById("123");

      expect(mockModel.findById).toHaveBeenCalledWith("123");
      expect(result).toBeDefined();
    });

    it("should return null when user not found", async () => {
      mockModel.findById.mockResolvedValue(null);

      const result = await repo.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return new user", async () => {
      const mockRaw = { _id: "456", email: "new@example.com", name: "New User" };
      mockModel.create.mockResolvedValue(mockRaw);

      const result = await repo.create({ email: "new@example.com", name: "New User" });

      expect(mockModel.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should propagate creation errors", async () => {
      mockModel.create.mockRejectedValue(new Error("Validation failed"));

      await expect(repo.create({ email: "bad", name: "Bad" })).rejects.toThrow("Validation failed");
    });
  });

  describe("deactivate", () => {
    it("should set user status to SUSPENDED", async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await repo.deactivate("user-123");

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        "user-123",
        { status: "SUSPENDED", isActive: false },
        { new: true }
      );
      expect(result).toBe(true);
    });

    it("should return false when user not found", async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(null);

      const result = await repo.deactivate("missing");

      expect(result).toBe(false);
    });
  });

  describe("setUserRole", () => {
    it("should update user role", async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue({});

      await repo.setUserRole("user-123", "ADMIN" as any);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith("user-123", { role: "ADMIN" });
    });
  });
});
