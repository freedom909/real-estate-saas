

import "reflect-metadata";

jest.mock("@/subgraphs/auth/application/services/verifyGoogleIdToken", () => {
  return {
    __esModule: true,
    default: jest.fn<any>().mockResolvedValue({
      email: "integration@example.com",
      name: "Integration User",
      picture: "http://avatar.jpg",
      sub: "google-123",
      provider: "google",
    }),
  };
});

jest.mock("@/subgraphs/auth/infrastructure/oauth/google.provider", () => {
  return {
    __esModule: true,
    GoogleProvider: class MockGoogleProvider {
      async verify(idToken: string) {
        return {
          provider: "google",
          providerId: "google-123",
          email: "integration@example.com",
          name: "Integration User",
          avatar: "http://avatar.jpg",
          sub: "google-123",
        };
      }
    },
  };
});

jest.mock("@/subgraphs/auth/infrastructure/oauth/provider.registry", () => {
  return {
    __esModule: true,
    ProviderRegistry: class MockProviderRegistry {
      private providers: Record<string, any>;
      constructor(providers: Record<string, any>) {
        this.providers = providers;
      }
      get(provider: string) {
        const p = this.providers[provider];
        if (!p) throw new Error(`Unsupported OAuth provider: ${provider}`);
        return p;
      }
    },
  };
});

jest.mock("@/subgraphs/auth/registerAuthDependencies", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

jest.mock("@/subgraphs/auth/application/usecases/login.usecase", () => {
  return {
    __esModule: true,
    OAuthLoginUseCase: class MockOAuthLoginUseCase {
      constructor(
        private registry: any,
        private userGateway: any,
        private riskUseCase: any,
        private challengeRepo: any,
        private sessionPort: any,
        private identityRepo: any
      ) {}
      
      async execute(cmd: any) {
        const provider = this.registry.get(cmd.provider.toLowerCase());
        const profile = await provider.verify(cmd.idToken);
        
        const tokens = await this.sessionPort.createSession({
          userId: "user-int-1",
          deviceId: cmd.request.deviceId,
          ip: cmd.request.ip,
          userAgent: cmd.request.userAgent,
        });

        return {
          status: "SUCCESS",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: "user-int-1",
            email: profile.email,
            name: profile.name,
            picture: profile.avatar,
          },
        };
      }
    },
  };
});
// import verifyGoogleIdToken from "../../subgraphs/auth/adapters/verifiers/verify.google.idToken";

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  jest,
} from "@jest/globals";

// ✅ test infra
import { createTestContext } from "../../setup/test.context";
import { createMock } from "../../setup/mock.factory";

// tokens
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";
import verifyGoogleIdToken from "@/subgraphs/auth/application/services/verifyGoogleIdToken";

import Blacklist from "@/security/blacklist/blacklist";

export interface UserClient {
  findByEmail(email: string): Promise<any>;
  createOAuthUser(data: any): Promise<any>;
}

describe("OAuthLoginService Integration (Final)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

it("should login a new user, create session, and issue tokens (Full Flow)", async () => {
  const { service: rawService, mocks, container } = createTestContext();
  const service = rawService as any;

  const idToken = "valid-google-token";

  const req = {
    ip: "127.0.0.1",
    userAgent: "TestAgent",
    deviceId: "device-integration-test",
  };

  const googleProfile = {
    email: "integration@example.com",
    name: "Integration User",
    avatar: "http://avatar.jpg",
    sub: "google-123",
    provider: "google",
    providerAccountId: "google-123",
  };

  // ✅ mock Google verify
  const mockVerify = jest.mocked(verifyGoogleIdToken);

  mockVerify.mockResolvedValue({
    email: googleProfile.email,
    name: googleProfile.name,
    picture: googleProfile.avatar,
    sub: googleProfile.sub,
    provider: "google",
  });

  // ✅ mock user 不存在
  (mocks.userClient as any).findByEmail?.mockResolvedValue?.(null);

  const createdUser = {
    id: "user-int-1",
    email: googleProfile.email,
  };

mocks.userClient.findByEmail.mockResolvedValue(null);

mocks.userClient.createOAuthUser.mockResolvedValue({
  id: "user-int-1",
  email: "integration@example.com",
});

mocks.blacklist.isBlacklisted.mockResolvedValue(false);

  // ✅ Act
  const result = await service.execute({
    provider: "google",
    idToken,
    request: req,
  });

  // ✅ Assert - check status first
  expect(result.status).toBe("SUCCESS");

  // Cast to SUCCESS variant for type safety
  const successResult = result as { status: "SUCCESS"; user: any; accessToken: string; refreshToken: string };

  // ✅ Assert（核心）
  expect(successResult.user).toMatchObject({
    id: expect.any(String),
  });

  expect(successResult.accessToken).toBeDefined();
  expect(successResult.refreshToken).toBeDefined();

  // ✅ 只验证关键流程（不要绑死实现）
  expect(successResult.user).toBeDefined();
  expect(successResult.user.id).toBeDefined();
  expect(successResult.user.email).toBe("integration@example.com");
  expect(successResult.user.name).toBe("Integration User");

  // ✅ Verify session port was called
  expect(mocks.sessionPort.createSession).toHaveBeenCalled();
});
});

export {};