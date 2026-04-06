

import "reflect-metadata";

jest.mock("../../subgraphs/auth/adapters/verifiers/verify.google.idToken"
 ,
  () => ({
    __esModule: true,
    default: jest.fn(),
  })
);
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

// modules
import { OAuthProvider } from "../../subgraphs/auth/adapters/normalized.oauth.profile";
import { OAuthAdapter } from "../../subgraphs/auth/adapters/oauth/oauth.adapter";

// tokens
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";
import verifyGoogleIdToken from "../../subgraphs/auth/adapters/verifiers/verify.google.idToken";

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
  const { service, mocks, container } = createTestContext();

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
    provider: OAuthProvider.GOOGLE,
    providerAccountId: "google-123",
  };

  // ✅ mock Google verify
  const mockVerify = jest.mocked(verifyGoogleIdToken);

  mockVerify.mockResolvedValue({
    email: googleProfile.email,
    name: googleProfile.name,
    picture: googleProfile.avatar,
    sub: googleProfile.sub,
    provider: OAuthProvider.GOOGLE,
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
// 型 'false' の引数を型 'never' のパラメーターに割り当てることはできません。
  // ✅ Act
  const result = await service.oauthLogin(
    OAuthProvider.GOOGLE,
    idToken,
    req
  );

  // ✅ Assert（核心）
  expect(result.user).toMatchObject({
    id: expect.any(String),
  });

  expect(result.accessToken).toBeDefined();
  expect(result.refreshToken).toBeDefined();

  // ✅ 只验证关键流程（不要绑死实现）
  expect(mockVerify).toHaveBeenCalled();
  expect(result.user).toBeDefined();
expect(result.user.id).toBeDefined();



  // ✅ DB 验证
  const SessionModel = container.resolve<mongoose.Model<any>>(
    TOKENS_AUTH.models.session
  );

  const session = await SessionModel.findOne({
    userId: result.user.id,
  });

  expect(session).toBeTruthy();

  const RefreshTokenModel = container.resolve<mongoose.Model<any>>(
    TOKENS_AUTH.models.refreshToken
  );

  const refreshToken = await RefreshTokenModel.findOne({
    userId: result.user.id,
  });

  expect(refreshToken).toBeTruthy();
  // ✅ 核心断言（永远正确）
expect(result.user).toBeDefined();
expect(result.accessToken).toBeDefined();
expect(result.refreshToken).toBeDefined();
expect(result.user.id).toBeDefined();
});
});

export {};