import "reflect-metadata";
import UserService from "../../../../../subgraphs/user/services/user.service";
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

interface MockUser {
  _id: { toString: () => string };
  email: string;
  name: string;
  picture: string;
  role: string;
  status: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

type MockedUserRepo = {
  findById: jest.Mock<(id: string) => Promise<MockUser | null>>;
  userByEmail: jest.Mock<(email: string) => Promise<MockUser | null>>;
};

function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    _id: { toString: () => "user-123" },
    email: "test@example.com",
    name: "Test User",
    picture: "https://example.com/avatar.jpg",
    role: "USER",
    status: "ACTIVE",
    tokenVersion: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

const mockUserRepo: MockedUserRepo = {
  findById: jest.fn(),
  userByEmail: jest.fn(),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(mockUserRepo as any);
  });

  describe("findById", () => {
    it("should return user response when user is found by ID", async () => {
      const mockUser = createMockUser();
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await service.findById("user-123");

      expect(mockUserRepo.findById).toHaveBeenCalledWith("user-123");
      expect(result).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/avatar.jpg",
        role: "USER",
        status: "ACTIVE",
        tokenVersion: 0,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      });
    });

    it("should lookup by email when ID contains @", async () => {
      const mockUser = createMockUser({ email: "user@example.com" });
      mockUserRepo.userByEmail.mockResolvedValue(mockUser);

      const result = await service.findById("user@example.com");

      expect(mockUserRepo.userByEmail).toHaveBeenCalledWith("user@example.com");
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result!.email).toBe("user@example.com");
    });

    it("should return null when user is not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const result = await service.findById("nonexistent-id");

      expect(result).toBeNull();
    });

    it("should return null when email lookup returns null", async () => {
      mockUserRepo.userByEmail.mockResolvedValue(null);

      const result = await service.findById("missing@example.com");

      expect(result).toBeNull();
    });

    it("should propagate repository errors", async () => {
      const error = new Error("DB connection failed");
      mockUserRepo.findById.mockRejectedValue(error);

      await expect(service.findById("user-123")).rejects.toThrow("DB connection failed");
    });
  });

  describe("userByEmail", () => {
    it("should return user when found by email", async () => {
      const mockUser = createMockUser();
      mockUserRepo.userByEmail.mockResolvedValue(mockUser);

      const result = await service.userByEmail("test@example.com");

      expect(mockUserRepo.userByEmail).toHaveBeenCalledWith("test@example.com");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-123");
      expect(result!.email).toBe("test@example.com");
    });

    it("should return null when user not found by email", async () => {
      mockUserRepo.userByEmail.mockResolvedValue(null);

      const result = await service.userByEmail("missing@example.com");

      expect(result).toBeNull();
    });

    it("should propagate repository errors", async () => {
      const error = new Error("Query failed");
      mockUserRepo.userByEmail.mockRejectedValue(error);

      await expect(service.userByEmail("test@example.com")).rejects.toThrow("Query failed");
    });
  });

  describe("deactivate", () => {
    it("should throw not implemented error", () => {
      expect(() => service.deactivate("user-123")).toThrow("Method not implemented.");
    });
  });
});
