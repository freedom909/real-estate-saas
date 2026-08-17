import "reflect-metadata";
import UserService from "../../../../../subgraphs/user/services/user.service";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

function createMockUser(overrides: any = {}) {
  return {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    picture: "https://example.com/avatar.jpg",
    role: "CUSTOMER",
    status: "ACTIVE",
    isActive: true,
    tokenVersion: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

const mockUserRepo = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  deactivate: jest.fn(),
  setUserRole: jest.fn(),
  save: jest.fn(),
  activate: jest.fn(),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new (UserService as any)(mockUserRepo);
  });

  describe("findById", () => {
    it("should return user response when user is found by ID", async () => {
      const mockUser = createMockUser();
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await service.findById("user-123");

      expect(mockUserRepo.findById).toHaveBeenCalledWith("user-123");
      expect(result).toMatchObject({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });
    });

    it("should lookup by email when ID contains @", async () => {
      const mockUser = createMockUser({ email: "user@example.com" });
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findById("user@example.com");

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
      expect(mockUserRepo.findById).not.toHaveBeenCalled();
      expect(result).not.toBeNull();
    });

    it("should return null when user is not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const result = await service.findById("nonexistent-id");

      expect(result).toBeNull();
    });
  });

  describe("userByEmail", () => {
    it("should return user when found by email", async () => {
      const mockUser = createMockUser();
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const result = await service.userByEmail("test@example.com");

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("user-123");
    });

    it("should return null when not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await service.userByEmail("missing@example.com");

      expect(result).toBeNull();
    });
  });

  describe("deactivate", () => {
    it("should call repository deactivate", async () => {
      mockUserRepo.deactivate.mockResolvedValue(true);

      const result = await service.deactivate("user-123");

      expect(mockUserRepo.deactivate).toHaveBeenCalledWith("user-123");
      expect(result).toBe(true);
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      const mockUser = createMockUser();
      mockUserRepo.create.mockResolvedValue(mockUser);

      const result = await service.create({ email: "new@test.com", name: "New User" });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("new@test.com");
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw if user already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(createMockUser());

      await expect(
        service.create({ email: "existing@test.com", name: "Existing" })
      ).rejects.toThrow("User with this email already exists");
    });
  });
});
