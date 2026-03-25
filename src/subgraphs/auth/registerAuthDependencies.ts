

import "reflect-metadata";
import { DependencyContainer } from "tsyringe";

// TOKENS
import { TOKENS_AUTH } from "../../modules/auth/container/auth.tokens";
import { TOKENS } from "../../shared/infra/tokens";
import { TOKENS_INFRA } from "../../infrastructure/infra.tokens";
import { TOKENS_USER } from "../../modules/user/container/user.tokens";

// infra
import { createRedis } from "../../infrastructure/redis/redis";

// models
import RefreshTokenModel from "./models/refreshToken.model";
import CredentialModel from "./models/credential.model";
import SessionModel from "./models/session.model";
import RiskEventModel from "./models/risk.event.model";

// repos
import CredentialRepo from "./repos/credential.repo";
import RefreshTokenRepository from "./repos/refresh-token.repo";
import { RiskEventRepo } from "./repos/risk.event.repo";
import SessionRepository from "./repos/session.repo";
import SessionService from "./services/session.service";


// services
import LoginRiskService from "./services/risk/login.risk.service";
import RefreshTokenService from "./services/refreshToken.service";
import { TokenService } from "./services/token.service";

import { OAuthLoginService } from "./services/oauth.login.service";

// adapters
import UserClient from "./adapters/user.client";
import { GoogleOAuthAdapter } from "./adapters/3rdLogin/google.adapter";
import GithubOAuthAdapter from "./adapters/3rdLogin/github.adapter";
import OAuthAdapterRegistry from "./adapters/oauth.adapter.registry";

// ✅ blacklist
import Blacklist from "../../security/blacklist/blacklist";
import { OAuthProvider } from "./adapters/normalized.oauth.profile";
import sessionRepo from "./repos/session.repo";
import { GeminiSecurityService } from "@/security/service/geminiSecurity.service";
import { TOKENS_SECURITY } from "@/security/container/security.tokens";

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

  container.register(TOKENS_AUTH.models.session, {
    useValue: SessionModel,
  });

  container.register(TOKENS_AUTH.models.riskEvent, {
    useValue: RiskEventModel,
  });

  container.register(TOKENS_AUTH.models.refreshToken, {
    useValue: RefreshTokenModel,
  });

  container.register(TOKENS_AUTH.models.credential, {
    useValue: CredentialModel,
  });

  // ======================================================
  // REPOSITORIES
  // ======================================================

  container.register(TOKENS_AUTH.repos.riskEventRepo, {
  useFactory: (c) =>
    new RiskEventRepo(
      c.resolve(TOKENS_AUTH.models.riskEvent),
      c.resolve(TOKENS_AUTH.repos.sessionRepo),
      c.resolve(TOKENS_AUTH.repos.refreshTokenRepo)
    ),
  });

  container.register(TOKENS_AUTH.repos.refreshTokenRepo, {
    useFactory: (c) =>
      new RefreshTokenRepository(
         c.resolve(TOKENS_AUTH.models.refreshToken),
      ),
  });

  container.register(TOKENS_AUTH.repos.credentialRepo, {
    useFactory: (c) =>
      new CredentialRepo({
        CredentialModel: c.resolve(TOKENS_AUTH.models.credential),
      }),
  });

  container.register(TOKENS_AUTH.repos.sessionRepo, {
    useFactory: (c) =>
      new SessionRepository(
         c.resolve(TOKENS_AUTH.models.session),
      ),
  });

  // ======================================================
  // GRAPHQL CLIENT
  // ======================================================

  container.register(TOKENS_USER.userClient, {
    useFactory: () => new UserClient(),
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
  container.register(TOKENS_AUTH.services.loginRiskService, {
    useFactory: (c) =>
      new LoginRiskService(
        c.resolve(TOKENS_AUTH.repos.riskEventRepo),
        c.resolve(TOKENS_INFRA.infra.redis),
        c.resolve(TOKENS_AUTH.repos.sessionRepo)
      ),
  });

  container.register(TOKENS_AUTH.services.tokenService, {
    useFactory: (c) =>
      new TokenService(
        c.resolve(TOKENS.security.blacklist),
        c.resolve(TOKENS_AUTH.repos.refreshTokenRepo),
      ),
  });

  container.register(TOKENS_AUTH.services.refreshTokenService, {
    useFactory: (c) =>
      new RefreshTokenService(
        c.resolve(TOKENS_AUTH.services.tokenService),
        c.resolve(TOKENS_AUTH.repos.refreshTokenRepo),
        c.resolve(TOKENS_AUTH.repos.sessionRepo),
        c.resolve(TOKENS_AUTH.services.loginRiskService),
      ),
  });

  container.register(TOKENS_AUTH.services.oauthloginService, {
    useFactory: (c) =>
      new OAuthLoginService(
        c.resolve(TOKENS_AUTH.adapters.oauthAdapterRegistry),
        c.resolve(TOKENS_USER.userClient),
        c.resolve(TOKENS_AUTH.services.tokenService),
        c.resolve(TOKENS_AUTH.services.sessionService),
        c.resolve(TOKENS_AUTH.services.loginRiskService), 
      ),
  });

  container.register(TOKENS_AUTH.services.sessionService, {
    useFactory: (c) =>
      new SessionService(
        c.resolve(TOKENS_AUTH.repos.sessionRepo),       
      ),
  });

}