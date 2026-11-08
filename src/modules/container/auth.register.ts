

import "reflect-metadata";
import { DependencyContainer } from "tsyringe";

// TOKENS
import { TOKENS_AUTH } from "../tokens/auth.tokens";

import { TOKENS_INFRA } from "../tokens/infra.tokens";
import { TOKENS_USER } from "../tokens/user.tokens";

// infra
import { createRedis } from "../../infrastructure/redis/redis";


// ✅ blacklist
// import { OAuthProvider } from "./adapters/normalized.oauth.profile";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
import Blacklist from "@/security/blacklist/blacklist";

import AuditClient from "@/packages/audit-sdk/src/client/audit.client";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { VerifyOtpUseCase } from "../../subgraphs/auth/application/usecases/verifyOtp.usecase";

import { RiskEventRepo } from "../../subgraphs/auth/infrastructure/repos/risk.event.repo";
import CredentialRepo from "../../subgraphs/user/infra/repos/credential.repo";
import SessionRepository from "../../subgraphs/auth/infrastructure/repos/session.repo";
import RedisRefreshTokenRepo from "../../subgraphs/auth/infrastructure/repos/refresh-token.redis.repo";
import { RefreshTokenUseCase } from "../../subgraphs/auth/application/usecases/refreshToken.usecase";
// import TrustedDeviceRepository from "./infrastructure/repos/trusted-device.repo";
import UserRepo from "../../subgraphs/auth/infrastructure/repos/user.repo";
import TrustedDeviceRepository from "@/security/infrastructure/repos/trustedDevice.repo";
import TrustedDeviceModel from "@/security/infrastructure/models/trusted.device.model";
import { UserClient } from "@/packages/user-sdk/src/client/user.client";
import { ProviderRegistry } from "../../subgraphs/auth/infrastructure/oauth/provider.registry";
import { AuthGuard } from "../../subgraphs/auth/guards/auth.guard";
import EvaluateRiskUseCase from "@/security/application/evaluateRisk.usecase";
import { ChallengeModel } from "../../subgraphs/auth/infrastructure/models/challenge.model";
import ChallengeRepo from "../../subgraphs/auth/infrastructure/repos/challenge.repo";
import { OAuthLoginUseCase } from "../../subgraphs/auth/application/usecases/login.usecase";
import { SessionService } from "../../subgraphs/auth/infrastructure/services/session.service";
import { TokenBindingService } from "../../subgraphs/auth/infrastructure/services/token-binding.service";
import { IdentityRepository } from "../../subgraphs/auth/infrastructure/repos/identity.repo";
import { IdentityModel } from "../../subgraphs/auth/infrastructure/models/identity.model";
import { JwtService } from "../../subgraphs/auth/infrastructure/services/jwt.service";
import SessionModel from "../../subgraphs/auth/infrastructure/models/session.model";
import { GoogleOAuthProvider } from "../../subgraphs/auth/infrastructure/oauth/google.oauthProvider";
import { GitHubOAuthProvider } from "../../subgraphs/auth/infrastructure/oauth/github.oauthProvider";
import { FacebookOAuthProvider } from "../../subgraphs/auth/infrastructure/oauth/facebook.oauthProvider";
import { UserGateway } from "../../subgraphs/auth/infrastructure/gateways/user.gateway.impl";

export default function authRegister(container: DependencyContainer) {

  // ================= INFRA =================
  const redis = createRedis();

  container.register(TOKENS_INFRA.infra.redis, {
    useValue: redis,
  });

  container.register(TOKENS_SECURITY.services.blacklist, {
    useValue: new Blacklist(redis),
  });

  container.register(TOKENS_SECURITY.evaluateRiskUseCase, {
    useClass: EvaluateRiskUseCase,
  });

  container.register(TOKENS_SECURITY.models.trustedDevice, {
    useValue: TrustedDeviceModel,
  });


  container.register(TOKENS_SECURITY.challengeRepo, {
    useClass: ChallengeRepo
  });
  
  // ================= PROVIDERS =================
  container.register("GoogleProvider", {
    useClass: GoogleOAuthProvider
  });

  container.register("GitHubProvider", {
    useClass: GitHubOAuthProvider
  });

  container.register("FacebookProvider", {
    useClass: FacebookOAuthProvider
  });

  container.register(TOKENS_AUTH.usecases.providerRegistry, {
    useFactory: (c) => new ProviderRegistry({
      google: c.resolve("GoogleProvider"),
      github: c.resolve("GitHubProvider"),
      facebook: c.resolve("FacebookProvider")
    })
  });

  // ================= REPOS =================
  container.register(TOKENS_AUTH.repos.userRepo, {
    useClass: UserRepo
  });
container.register(TOKENS_AUTH.repos.credentialRepo, {
  useClass: CredentialRepo
});

  container.register(TOKENS_SECURITY.trustedDeviceRepo, {
    useClass: TrustedDeviceRepository
  });

  container.register(TOKENS_AUTH.repos.sessionRepo, {
    useClass: SessionRepository
  });

  container.register(TOKENS_AUTH.repos.refreshTokenRepo, {
    useClass: RedisRefreshTokenRepo
  });

  container.register(TOKENS_AUTH.repos.challengeRepo, {
    useClass: ChallengeRepo
  });

// ✅ 2. 再注册 repo
container.register(TOKENS_AUTH.repos.identityRepo, {
  useClass: IdentityRepository,
});
container.register(TOKENS_AUTH.repos.riskEventRepo, {
  useClass: RiskEventRepo
});
  // ================= USECASES =================
  container.register(TOKENS_AUTH.usecases.oauthLoginUseCase, {
    useClass: OAuthLoginUseCase
  });

  container.register(TOKENS_AUTH.usecases.verifyOtpUseCase, {
    useClass: VerifyOtpUseCase
  });

  container.register(TOKENS_AUTH.services.sessionService, {
    useClass: SessionService
  });

  container.register(TOKENS_AUTH.usecases.refreshTokenUseCase, {
    useClass: RefreshTokenUseCase
  });

  // ================= CLIENT =================
container.register(TOKENS_USER.userClient, {
  useFactory: () =>
    new UserClient(
      process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql",
      process.env.INTERNAL_SERVICE_TOKEN // Ensure your UserClient constructor handles this
    ),
});

  container.register(TOKENS_AUDIT.auditClient, {
    useValue: new AuditClient(
      process.env.AUDIT_SUBGRAPH_URL || "http://localhost:4080/graphql"
    ),
  });

// =================ports=================
container.register(TOKENS_AUTH.ports.userGateway, {
  useClass: UserGateway,
});

container.register(TOKENS_AUTH.ports.sessionPort, {
  useClass:SessionService 
});

// ✅ 1. 先注册 model
 // ================= models =================
container.register(TOKENS_AUTH.models.identityModel, {
  useValue: IdentityModel,
});

 container.register(TOKENS_AUTH.models.challengeModel, {
  useValue: ChallengeModel,
});

container.register(TOKENS_AUTH.models.session, {
  useValue: SessionModel,
});
 // ================= services =================
container.registerSingleton(
  TOKENS_AUTH.services.jwtService,
  JwtService
);
container.registerSingleton(AuthGuard, AuthGuard);
container.register(TOKENS_AUTH.services.tokenBindingService, {
  useClass: TokenBindingService
});
  return container;
}
