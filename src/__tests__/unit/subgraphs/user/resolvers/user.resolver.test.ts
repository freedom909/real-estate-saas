import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies before importing resolvers
jest.mock("@/modules/tokens/user.tokens", () => ({
  TOKENS_USER: {
    services: { userService: Symbol.for("userService") },
    usecase: { createOAuthUserUseCase: Symbol.for("createOAuthUserUseCase") },
  },
}));

jest.mock("@/subgraphs/user/resolvers/verifyInternalRequest", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("@/core/account/infra/tenant.acl", () => ({
  TenantACL: jest.fn(),
}));

jest.mock("@/modules/tokens/tenant.tokens", () => ({
  TOKENS_TENANT: {},
}));

jest.mock("@/modules/tokens/account.token", () => ({
  TOKENS_ACCOUNT: {},
}));

jest.mock("@/subgraphs/user/models/user.model", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("mongoose", () => ({
  __esModule: true,
  default: {},
}));

// Mock tsyringe container
const mockResolve = jest.fn();
jest.mock("tsyringe", () => ({
  container: {
    resolve: mockResolve,
  },
}));

import resolvers from "@/subgraphs/user/resolvers/user.resolver";
import verifyInternalRequest from "@/subgraphs/user/resolvers/verifyInternalRequest";
import { container } from "tsyringe";

type MockUserService = {
  findById: jest.Mock<any>;
  userByEmail: jest.Mock<any>;
  deactivate: jest.Mock<any>;
};

type MockUseCase = {
  execute: jest.Mock<any>;
};

function createMockContainer(service: MockUserService, useCase?: MockUseCase) {
  return {
    resolve: jest.fn((token: symbol) => {
      if (token === Symbol.for("userService")) return service;
      if (token === Symbol.for("createOAuthUserUseCase")) return useCase;
      return null;
    }),
  };
}

describe("User Resolvers", () => {
  let mockUserService: MockUserService;
  let mockUseCase: MockUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = {
      findById: jest.fn(),
      userByEmail: jest.fn(),
      deactivate: jest.fn(),
    };
    mockUseCase = {
      execute: jest.fn(),
    };
    (verifyInternalRequest as jest.Mock).mockImplementation(() => {});
  });

  describe("Customer.__resolveReference", () => {
    it("should resolve customer by ID", async () => {
      const mockCustomer = { id: "cust-1", email: "cust@example.com" };
      mockUserService.findById.mockResolvedValue(mockCustomer);
      const ctxContainer = createMockContainer(mockUserService);

      const result = await (resolvers as any).Customer.__resolveReference(
        { id: "cust-1" },
        { container: ctxContainer }
      );

      expect(ctxContainer.resolve).toHaveBeenCalledWith(Symbol.for("userService"));
      expect(mockUserService.findById).toHaveBeenCalledWith("cust-1");
      expect(result).toEqual(mockCustomer);
    });

    it("should return null when customer not found", async () => {
      mockUserService.findById.mockResolvedValue(null);
      const ctxContainer = createMockContainer(mockUserService);

      const result = await (resolvers as any).Customer.__resolveReference(
        { id: "missing" },
        { container: ctxContainer }
      );

      expect(result).toBeNull();
    });
  });

  describe("User.__resolveReference", () => {
    it("should resolve user by ID", async () => {
      const mockUser = { id: "user-1", email: "user@example.com" };
      mockUserService.findById.mockResolvedValue(mockUser);
      const ctxContainer = createMockContainer(mockUserService);

      const result = await (resolvers as any).User.__resolveReference(
        { id: "user-1" },
        { container: ctxContainer }
      );

      expect(ctxContainer.resolve).toHaveBeenCalledWith(Symbol.for("userService"));
      expect(mockUserService.findById).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockUser);
    });
  });

  describe("Query.me", () => {
    it("should return current user from context", () => {
      const mockUser = { id: "user-1", email: "me@example.com" };

      const result = (resolvers as any).Query.me(null, {}, { user: mockUser });

      expect(result).toEqual(mockUser);
    });

    it("should throw UNAUTHORIZED when user not in context", () => {
      expect(() => {
        (resolvers as any).Query.me(null, {}, {});
      }).toThrow("UNAUTHORIZED");
    });

    it("should throw UNAUTHORIZED when context.user is null", () => {
      expect(() => {
        (resolvers as any).Query.me(null, {}, { user: null });
      }).toThrow("UNAUTHORIZED");
    });
  });

  describe("Query.user", () => {
    it("should return user by ID", async () => {
      const mockUser = { id: "user-1", email: "user@example.com" };
      mockResolve.mockReturnValue(mockUserService);
      mockUserService.findById.mockResolvedValue(mockUser);

      const result = await (resolvers as any).Query.user(null, { id: "user-1" }, {});

      expect(mockResolve).toHaveBeenCalledWith(Symbol.for("userService"));
      expect(mockUserService.findById).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockResolve.mockReturnValue(mockUserService);
      mockUserService.findById.mockResolvedValue(null);

      const result = await (resolvers as any).Query.user(null, { id: "missing" }, {});

      expect(result).toBeNull();
    });
  });

  describe("Query.internalUserByEmail", () => {
    it("should return user when valid internal request", async () => {
      const mockUser = { id: "user-1", email: "user@example.com" };
      mockResolve.mockReturnValue(mockUserService);
      mockUserService.userByEmail.mockResolvedValue(mockUser);

      const mockReq = {
        get: jest.fn().mockReturnValue("valid-token"),
        headers: { "x-service-token": "valid-token" },
      };

      process.env.INTERNAL_SERVICE_TOKEN = "valid-token";

      const result = await (resolvers as any).Query.internalUserByEmail(
        null,
        { email: "user@example.com" },
        { req: mockReq }
      );

      expect(mockUserService.userByEmail).toHaveBeenCalledWith("user@example.com");
      expect(result).toEqual(mockUser);
    });

    it("should throw when request object is missing", async () => {
      await expect(
        (resolvers as any).Query.internalUserByEmail(
          null,
          { email: "user@example.com" },
          {}
        )
      ).rejects.toThrow("Internal Server Error: Context setup failure");
    });

    it("should throw Forbidden when token is invalid", async () => {
      mockResolve.mockReturnValue(mockUserService);
      process.env.INTERNAL_SERVICE_TOKEN = "correct-token";

      const mockReq = {
        get: jest.fn().mockReturnValue("wrong-token"),
        headers: { "x-service-token": "wrong-token" },
      };

      // Make verifyInternalRequest throw on invalid token
      (verifyInternalRequest as jest.Mock).mockImplementation(() => {
        throw new Error("Forbidden: Invalid service token");
      });

      await expect(
        (resolvers as any).Query.internalUserByEmail(
          null,
          { email: "user@example.com" },
          { req: mockReq }
        )
      ).rejects.toThrow("Forbidden: Invalid service token");
    });
  });

  describe("Mutation.deactivateUser", () => {
    it("should call deactivate on user service", async () => {
      mockResolve.mockReturnValue(mockUserService);
      mockUserService.deactivate.mockResolvedValue(undefined);

      await (resolvers as any).Mutation.deactivateUser(null, { userId: "user-1" }, {});

      expect(mockUserService.deactivate).toHaveBeenCalledWith("user-1");
    });
  });

  describe("Mutation.createOAuthUser", () => {
    it("should execute createOAuthUserUseCase with input", async () => {
      const mockResult = { id: "new-user", email: "oauth@example.com" };
      mockResolve.mockReturnValue(mockUseCase);
      mockUseCase.execute.mockResolvedValue(mockResult);

      const input = {
        email: "oauth@example.com",
        provider: "google",
        profile: { name: "OAuth User", avatar: "https://example.com/avatar.jpg" },
      };

      const result = await (resolvers as any).Mutation.createOAuthUser(
        null,
        { input },
        {}
      );

      expect(mockUseCase.execute).toHaveBeenCalledWith(input);
      expect(result).toEqual(mockResult);
    });
  });
});
