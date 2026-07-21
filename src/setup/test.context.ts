import "reflect-metadata"
import { DependencyContainer } from "tsyringe";

import { createTestContainer } from "./test.container";
import { createMock } from "./mock.factory";

// tokens
import { TOKENS_AUTH } from "../modules/tokens/auth.tokens";
import { TOKENS_USER } from "../modules/tokens/user.tokens";
import { TOKENS_INFRA } from "../modules/tokens/infra.tokens";
import { TOKENS_SECURITY } from "../modules/tokens/security.tokens";

// services
import registerAuthDependencies from "../subgraphs/auth/registerAuthDependencies";
import { OAuthLoginUseCase } from "../subgraphs/auth/application/usecases/login.usecase";
import { jest } from "@jest/globals";

// domain
import { RiskEngine } from "../security/domain/risk.engine";
import { DecisionEngine } from "../security/domain/decision.engine";
import { IAuditRepo } from "../security/types";
import { ITrustedDeviceRepo } from "../security/domain/repos/ITrustedDeviceRepo";
import { IAiRiskEngine } from "../security/domain/ai.risk.engine";
import SessionPort from "../subgraphs/auth/domain/ports/session.port";

// types
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

  // 1️⃣ 创建 mocks
  const mocks = {
    userClient: {
      findByEmail: jest.fn(),
      createOAuthUser: jest.fn(),
    },
    blacklist: {
      isBlacklisted: jest.fn(),
    },
    riskEngine: {
      evaluate: jest.fn<any>().mockResolvedValue(0),
    },
    decisionEngine: {
      decide: jest.fn<any>().mockReturnValue("ALLOW"),
    },
    trustedDeviceRepo: {
      find: jest.fn<any>().mockResolvedValue(null),
    },
    aiRiskEngine: {
      evaluate: jest.fn<any>().mockResolvedValue({ score: 0 }),
    },
    redis: {
      get: jest.fn<any>().mockResolvedValue(null),
      setex: jest.fn<any>(),
    },
    auditRepo: {
      log: jest.fn<any>(),
    },
    sessionPort: {
      createSession: jest.fn<any>().mockResolvedValue({
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      }),
    },
    providerRegistry: {
      get: jest.fn<any>().mockReturnValue({
        verify: jest.fn<any>().mockResolvedValue({
          provider: "google",
          providerId: "google-123",
          email: "integration@example.com",
          name: "Integration User",
          avatar: "http://avatar.jpg",
          sub: "google-123",
        }),
      }),
    },
  } as any;

  // 2️⃣ 先注册 mocks（关键！）
  container.register(TOKENS_USER.userClient, {
    useValue: mocks.userClient,
  });

  container.register(TOKENS_SECURITY.services.blacklist, {
    useValue: mocks.blacklist,
  });

  // Register security dependencies
  container.register(TOKENS_SECURITY.riskEngine, {
    useValue: mocks.riskEngine,
  });

  container.register(TOKENS_SECURITY.decisionEngine, {
    useValue: mocks.decisionEngine,
  });

  container.register(TOKENS_SECURITY.trustedDeviceRepo, {
    useValue: mocks.trustedDeviceRepo,
  });

  container.register(TOKENS_SECURITY.aiRiskEngine, {
    useValue: mocks.aiRiskEngine,
  });

  container.register(TOKENS_INFRA.infra.redis, {
    useValue: mocks.redis,
  });

  container.register(TOKENS_SECURITY.auditRepo, {
    useValue: mocks.auditRepo,
  });

  container.register(TOKENS_AUTH.ports.sessionPort, {
    useValue: mocks.sessionPort,
  });

  // 3️⃣ 再注册 auth 依赖
  registerAuthDependencies(container);

  // 4️⃣ 注册 mock use case (override the registered one)
  container.register(TOKENS_AUTH.usecases.oauthLoginUseCase, {
    useValue: {
      execute: jest.fn<any>().mockImplementation(async (cmd: any) => {
        const provider = mocks.providerRegistry.get(cmd.provider.toLowerCase());
        const profile = await provider.verify(cmd.idToken);
        
        const tokens = await mocks.sessionPort.createSession({
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
      }),
    },
  });

  // 5️⃣ 最后 resolve service
  const service = container.resolve(TOKENS_AUTH.usecases.oauthLoginUseCase);
  return {
    container,
    service,
    mocks,
  };
}
