

import "reflect-metadata";
import { DependencyContainer } from "tsyringe";

// TOKENS
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";
import { TOKENS } from "../../shared/infra/tokens";
import { TOKENS_INFRA } from "../../infrastructure/infra.tokens";
import { TOKENS_USER } from "../../modules/tokens/user.tokens";

// infra
import { createRedis } from "../../infrastructure/redis/redis";

// models
import { Model } from "mongoose";
import RefreshTokenModel from "./models/refreshToken.model";
import CredentialModel from "./models/credential.model";
import SessionModel from "./models/session.model";
import RiskEventModel from "./models/risk.event.model";
import TrustedDeviceModel from "./models/trustedDevice";

// repos
import CredentialRepo from "./repos/credential.repo";
import RefreshTokenRepository from "./repos/refresh-token.repo";
import { RiskEventRepo } from "./repos/risk.event.repo";
import SessionRepository from "./repos/session.repo";
import TrustedDeviceRepository from "./repos/trusted-device.repo";

// services
import RefreshTokenService from "./services/refreshToken.service";
import { TokenService } from "./services/token.service";
import SessionService from "./services/session.service";
import { OAuthLoginService } from "./services/oauth.login.service";

// adapters
import UserClient from "./adapters/user.client";
import { GoogleOAuthAdapter } from "./adapters/3rdLogin/google.adapter";
import GithubOAuthAdapter from "./adapters/3rdLogin/github.adapter";
import OAuthAdapterRegistry from "./adapters/oauth.adapter.registry";

// ✅ blacklist
import { OAuthProvider } from "./adapters/normalized.oauth.profile";


import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import { AuditAdapter } from "./adapters/audit.client";
import { RiskEngine } from "@/security/domain/risk.engine";
import Blacklist from "@/security/blacklist/blacklist";
import { ServiceTokenService } from "./services/serviceToken.service";
import AuditClient from "@/packages/audit-sdk/src/client/audit.client";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";



export default function registerAuthDependencies(
  container: DependencyContainer
) {
  console.log("✅ REGISTER AUTH DEPENDENCIES");

  // ======================================================
  // INFRA
  // ======================================================

  const redis = createRedis();

  container.register(TOKENS_INFRA.infra.redis, {
    useValue: redis,
  });

  // ✅ blacklist（推荐用 useValue 避坑）
  container.register(TOKENS.security.blacklist, {
    useValue: new Blacklist(redis),
  });

  // ======================================================
  // MODELS
  // ======================================================
  container.register(TOKENS_AUTH.models.refreshToken, {
  useValue: RefreshTokenModel,
});

  container.register(TOKENS_AUTH.models.session, {
    useValue: SessionModel,
  });

  container.register(TOKENS_AUTH.models.riskEvent, {
    useValue: RiskEventModel,
  });

  container.register(TOKENS_AUTH.models.trustedDevice, {
    useValue: TrustedDeviceModel,
  });

  container.register(TOKENS_AUTH.repos.refreshTokenRepo, {
    useClass: RefreshTokenRepository
  });

  container.register(TOKENS_AUTH.models.credential, {
    useValue: CredentialModel,
  });

  // ======================================================
  // REPOSITORIES
  // ======================================================

  container.register(TOKENS_AUTH.repos.riskEventRepo, {
    useClass: RiskEventRepo
  });

  container.register(TOKENS_AUTH.repos.credentialRepo, {
    useClass: CredentialRepo
  });

  container.register(TOKENS_AUTH.repos.sessionRepo, {
 useClass:SessionRepository
  });

  container.register(TOKENS_SECURITY.trustedDeviceRepo, {
    useClass: TrustedDeviceRepository,
  });

  // ======================================================
  // GRAPHQL CLIENT
  // ======================================================

  container.register(TOKENS_USER.userClient, {
    useClass: UserClient,
  });

  // ======================================================
  // OAUTH ADAPTERS
  // ======================================================

  // 1️⃣ 注册 adapter（必须有！！！）
  container.registerSingleton(GoogleOAuthAdapter);
  container.registerSingleton(GithubOAuthAdapter);

  // 2️⃣ 注册 registry
  container.registerSingleton(
    TOKENS_AUTH.adapters.oauthAdapterRegistry,
    OAuthAdapterRegistry
  );

  // 3️⃣ 初始化 registry
  const registry = container.resolve<OAuthAdapterRegistry>(
    TOKENS_AUTH.adapters.oauthAdapterRegistry
  );

  // 4️⃣ 注册 provider → adapter 映射
  registry.register(
    OAuthProvider.GOOGLE,
    container.resolve(GoogleOAuthAdapter)
  );

  registry.register(
    OAuthProvider.GITHUB,
    container.resolve(GithubOAuthAdapter)
  );

  // 5️⃣ debug
  registry.debug();

  console.log("✅ OAuth adapters registered");
  // ======================================================
  // SERVICES
  // ======================================================
  registry.debug(); // 👉 看是否注册成功


  container.register(TOKENS_AUTH.services.tokenService, {
    useClass: TokenService
  });

  container.register(TOKENS_AUTH.services.refreshTokenService, {
    useClass: RefreshTokenService
  });

  container.register(TOKENS_AUTH.services.oauthloginService, {
    useClass: OAuthLoginService
  });

  container.register(TOKENS_AUTH.services.sessionService, {
    useClass: SessionService
  });

  container.register(TOKENS_AUTH.auditPort, {
    useClass: AuditAdapter
  })

  container.register(TOKENS_AUTH.services.serviceTokenService, {
    useClass: ServiceTokenService,
  });

container.register(TOKENS_AUDIT.auditClient, {
  useValue: new AuditClient(
    process.env.AUDIT_SUBGRAPH_URL || "http://localhost:4080/graphql"
  ),
});

  return container;
}
