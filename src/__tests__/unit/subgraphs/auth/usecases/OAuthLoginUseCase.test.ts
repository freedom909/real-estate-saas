import "reflect-metadata";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock all dependencies before importing
jest.mock("@/modules/tokens/auth.tokens", () => ({
  TOKENS_AUTH: {
    usecases: { providerRegistry: Symbol.for("ProviderRegistry") },
    ports: {
      userGateway: Symbol.for("UserGateway"),
      sessionPort: Symbol.for("SessionPort"),
    },
    repos: {
      challengeRepo: Symbol.for("ChallengeRepo"),
      identityRepo: Symbol.for("IdentityRepo"),
    },
    models: {
      challengeModel: Symbol.for("ChallengeModel"),
    },
  },
}));

jest.mock("@/modules/tokens/security.tokens", () => ({
  TOKENS_SECURITY: {
    evaluateRiskUseCase: Symbol.for("EvaluateRiskUseCase"),
  },
}));

jest.mock("@/subgraphs/auth/application/dto/auth-response.mapper", () => ({
  AuthResponseMapper: {
    toUserDTO: jest.fn((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      picture: user.picture,
    })),
  },
}));

jest.mock("@/subgraphs/auth/infrastructure/repos/challenge.repo", () => ({
  __esModule: true,
  default: class MockChallengeRepo {},
}));

jest.mock("@/subgraphs/auth/domain/ports/session.port", () => ({
  __esModule: true,
  default: class MockSessionPort {},
}));

jest.mock("@/subgraphs/auth/infrastructure/repos/identity.repo", () => ({
  IdentityRepository: class MockIdentityRepo {},
}));

jest.mock("@/subgraphs/auth/domain/ports/user.gateway", () => ({
  __esModule: true,
  default: class MockUserGateway {},
}));

jest.mock("@/subgraphs/auth/infrastructure/oauth/provider.registry", () => ({
  ProviderRegistry: class MockProviderRegistry {},
}));

jest.mock("@/security/application/evaluateRisk.usecase", () => ({
  __esModule: true,
  default: class MockEvaluateRiskUseCase {},
}));

describe("OAuthLoginUseCase", () => {
  let useCase: any;
  let mockRegistry: any;
  let mockUserGateway: any;
  let mockRiskUseCase: any;
  let mockChallengeRepo: any;
  let mockSessionPort: any;
  let mockIdentityRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRegistry = { get: jest.fn() };
    mockUserGateway = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      createFromOAuth: jest.fn(),
    };
    mockRiskUseCase = { execute: jest.fn() };
    mockChallengeRepo = { create: jest.fn() };
    mockSessionPort = { createSession: jest.fn() };
    mockIdentityRepo = {
      findByProvider: jest.fn(),
      create: jest.fn(),
    };

    const { OAuthLoginUseCase } = require("@/subgraphs/auth/application/usecases/login.usecase");
    useCase = new OAuthLoginUseCase(
      mockRegistry,
      mockUserGateway,
      mockRiskUseCase,
      mockChallengeRepo,
      mockSessionPort,
      mockIdentityRepo
    );
  });

  const mockProfile = {
    provider: "google",
    providerId: "google-123",
    email: "test@example.com",
    name: "Test User",
    picture: "avatar.jpg",
  };

  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    role: "USER",
    picture: "avatar.jpg",
  };

  it("should return SUCCESS for existing user with ALLOW risk", async () => {
    const mockProvider = { verify: jest.fn<any>().mockResolvedValue(mockProfile) };
    mockRegistry.get.mockReturnValue(mockProvider);
    mockIdentityRepo.findByProvider.mockResolvedValue({ userId: "user-1" });
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockRiskUseCase.execute.mockResolvedValue({ decision: "ALLOW" });
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    const result = await useCase.execute({
      provider: "google",
      idToken: "token-123",
      request: { ip: "127.0.0.1", userAgent: "Chrome", deviceId: "dev-1" },
    });

    expect(result.status).toBe("SUCCESS");
    expect(result.accessToken).toBe("access-123");
    expect(result.refreshToken).toBe("refresh-123");
  });

  it("should create new user when identity not found", async () => {
    const mockProvider = { verify: jest.fn<any>().mockResolvedValue(mockProfile) };
    mockRegistry.get.mockReturnValue(mockProvider);
    mockIdentityRepo.findByProvider.mockResolvedValue(null);
    mockUserGateway.findByEmail.mockResolvedValue(null);
    mockUserGateway.createFromOAuth.mockResolvedValue(mockUser);
    mockRiskUseCase.execute.mockResolvedValue({ decision: "ALLOW" });
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    const result = await useCase.execute({
      provider: "google",
      idToken: "token-123",
      request: { ip: "127.0.0.1", userAgent: "Chrome", deviceId: "dev-1" },
    });

    expect(mockUserGateway.createFromOAuth).toHaveBeenCalled();
    expect(mockIdentityRepo.create).toHaveBeenCalled();
    expect(result.status).toBe("SUCCESS");
  });

  it("should merge with existing user by email", async () => {
    const existingUser = { ...mockUser, id: "existing-user" };
    const mockProvider = { verify: jest.fn<any>().mockResolvedValue(mockProfile) };
    mockRegistry.get.mockReturnValue(mockProvider);
    mockIdentityRepo.findByProvider.mockResolvedValue(null);
    mockUserGateway.findByEmail.mockResolvedValue(existingUser);
    mockRiskUseCase.execute.mockResolvedValue({ decision: "ALLOW" });
    mockSessionPort.createSession.mockResolvedValue({
      accessToken: "access-123",
      refreshToken: "refresh-123",
    });

    const result = await useCase.execute({
      provider: "google",
      idToken: "token-123",
      request: { ip: "127.0.0.1", userAgent: "Chrome", deviceId: "dev-1" },
    });

    expect(mockUserGateway.createFromOAuth).not.toHaveBeenCalled();
    expect(result.status).toBe("SUCCESS");
  });

  it("should return BLOCKED when risk decision is BLOCK", async () => {
    const mockProvider = { verify: jest.fn<any>().mockResolvedValue(mockProfile) };
    mockRegistry.get.mockReturnValue(mockProvider);
    mockIdentityRepo.findByProvider.mockResolvedValue({ userId: "user-1" });
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockRiskUseCase.execute.mockResolvedValue({ decision: "BLOCK" });

    const result = await useCase.execute({
      provider: "google",
      idToken: "token-123",
      request: { ip: "127.0.0.1", userAgent: "Chrome", deviceId: "dev-1" },
    });

    expect(result.status).toBe("BLOCKED");
  });

  it("should return CHALLENGE when risk decision is CHALLENGE", async () => {
    const mockProvider = { verify: jest.fn<any>().mockResolvedValue(mockProfile) };
    mockRegistry.get.mockReturnValue(mockProvider);
    mockIdentityRepo.findByProvider.mockResolvedValue({ userId: "user-1" });
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockRiskUseCase.execute.mockResolvedValue({ decision: "CHALLENGE" });
    mockChallengeRepo.create.mockResolvedValue({ id: "ch-1" });

    const result = await useCase.execute({
      provider: "google",
      idToken: "token-123",
      request: { ip: "127.0.0.1", userAgent: "Chrome", deviceId: "dev-1" },
    });

    expect(result.status).toBe("CHALLENGE");
    expect(result.challengeId).toBe("ch-1");
  });

  it("should throw for invalid provider", async () => {
    mockRegistry.get.mockImplementation(() => {
      throw new Error("Unknown provider");
    });

    await expect(
      useCase.execute({
        provider: "unknown",
        idToken: "token",
        request: {},
      })
    ).rejects.toThrow("Unknown provider");
  });
});
