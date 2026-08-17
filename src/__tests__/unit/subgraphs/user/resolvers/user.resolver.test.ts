import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock dependencies before importing resolvers
jest.mock("@/modules/tokens/user.tokens", () => ({
  TOKENS_USER: {
    services: { userService: Symbol.for("userService") },
    usecase: {
      createOAuthUserUseCase: Symbol.for("createOAuthUserUseCase"),
      becomeHostUseCase: Symbol.for("user.usecase.becomeHostUseCase"),
    },
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

jest.mock("@/subgraphs/user/infra/models/user.model", () => ({
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

type MockUserService = {
  findById: jest.Mock<any>;
  userByEmail: jest.Mock<any>;
  deactivate: jest.Mock<any>;
};

type MockUseCase = {
  execute: jest.Mock<any>;
};

function createMockContainer(service: MockUserService, useCases?: Record<string, MockUseCase>) {
  return {
    resolve: jest.fn((token: symbol) => {
      if (token === Symbol.for("userService")) return service;
      if (token === Symbol.for("createOAuthUserUseCase")) return useCases?.createOAuthUser;
      if (token === Symbol.for("user.usecase.becomeHostUseCase")) return useCases?.becomeHost;
      return null;
    }),
  };
}

describe("User Resolvers", () => {
  let mockUserService: MockUserService;
  let mockUseCases: Record<string, MockUseCase>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserService = {
      findById: jest.fn(),
      userByEmail: jest.fn(),
      deactivate: jest.fn(),
    };
    mockUseCases = {
      createOAuthUser: { execute: jest.fn() },
      becomeHost: { execute: jest.fn() },
    };
    (verifyInternalRequest as jest.Mock).mockImplementation(() => {});
  });

  describe("Customer.__resolveReference", () => {
    it("should resolve customer by ID", async () => {
      const mockCustomer = { id: "cust-1", email: "cust@example.com" };
      mockUserService.findById.mockResolvedValue(mockCustomer);
      const ctxContainer = createMockContainer(mockUserService, mockUseCases);

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
      const ctxContainer = createMockContainer(mockUserService, mockUseCases);

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
      const ctxContainer = createMockContainer(mockUserService, mockUseCases);

      const result = await (resolvers as any).User.__resolveReference(
        { id: "user-1" },
        { container: ctxContainer }
      );

      expect(mockUserService.findById).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockUserService.findById.mockResolvedValue(null);
      const ctxContainer = createMockContainer(mockUserService, mockUseCases);

      const result = await (resolvers as any).User.__resolveReference(
        { id: "missing" },
        { container: ctxContainer }
      );

      expect(result).toBeNull();
    });
  });

  describe("Mutation.becomeHost", () => {
    it("should call becomeHostUseCase.execute with correct args", async () => {
      const mockResult = { id: "user-1", role: "HOST" };
      mockUseCases.becomeHost.execute.mockResolvedValue(mockResult);
      const ctxContainer = createMockContainer(mockUserService, mockUseCases);

      const result = await (resolvers as any).Mutation.becomeHost(
        null,
        {},
        { user: { userId: "user-1" }, container: ctxContainer }
      );

      expect(mockUseCases.becomeHost.execute).toHaveBeenCalledWith("user-1");
      expect(result).toEqual(mockResult);
    });
  });
});
