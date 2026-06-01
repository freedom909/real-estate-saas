import "reflect-metadata"
import { DependencyContainer } from "tsyringe";

import { createTestContainer } from "./test.container";
import { createMock } from "./mock.factory";

// tokens
import { TOKENS_AUTH } from "../modules/tokens/auth.tokens";
import { TOKENS_USER } from "../modules/tokens/user.tokens";
import { TOKENS_INFRA } from "../infrastructure/infra.tokens";
import { TOKENS } from "../shared/infra/tokens";

// services
import registerAuthDependencies from "../subgraphs/auth/registerAuthDependencies";
import OAuthLoginService from "../subgraphs/auth/services/oauth.login.service";
import { jest } from "@jest/globals";

// types（你可以自己补）
type UserClient = {
  findByEmail(email: string): Promise<any>;
  createOAuthUser(data: any): Promise<any>;
};

type RedisClient = {
  get(key: string): Promise<any>;
  set(key: string, val: any): Promise<any>;
};

type Blacklist = {
  isBlacklisted(token: string): Promise<boolean>;
  blacklist(token: string): Promise<void>;
};

export function createTestContext() {
  const container = createTestContainer();

  // ✅ 1️⃣ mocks
// 1️⃣ 创建 mocks
const mocks = {
  userClient: {
    findByEmail: jest.fn(),
    createOAuthUser: jest.fn(),
  },
  blacklist: {
    isBlacklisted: jest.fn(),
  },
} as any;

// 2️⃣ 先注册 mocks（关键！）
container.register(TOKENS_USER.userClient, {
  useValue: mocks.userClient,
});

container.register(TOKENS.security.blacklist, {
  useValue: mocks.blacklist,
});

// 3️⃣ 再注册 auth 依赖
registerAuthDependencies(container);

// 4️⃣ 最后 resolve service
const service = container.resolve<OAuthLoginService>(TOKENS_AUTH.services.oauthloginService);
  return {
    container,
    service,
    mocks,
  };
}