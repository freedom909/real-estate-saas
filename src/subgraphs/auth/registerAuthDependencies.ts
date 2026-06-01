

import "reflect-metadata";
import { DependencyContainer } from "tsyringe";

// TOKENS
import { TOKENS_AUTH } from "../../modules/tokens/auth.tokens";
import { TOKENS } from "../../shared/infra/tokens";
import { TOKENS_INFRA } from "../../infrastructure/infra.tokens";
import { TOKENS_USER } from "../../modules/tokens/user.tokens";

// infra
import { createRedis } from "../../infrastructure/redis/redis";


// ✅ blacklist
// import { OAuthProvider } from "./adapters/normalized.oauth.profile";
import { TOKENS_SECURITY } from "@/modules/tokens/security.tokens";
// import { AuditAdapter } from "./adapters/audit.client";
import { RiskEngine } from "@/security/domain/risk.engine";
import Blacklist from "@/security/blacklist/blacklist";

import AuditClient from "@/packages/audit-sdk/src/client/audit.client";
import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { VerifyOtpUseCase } from "./application/usecases/verifyOtp.usecase";

import { RiskEventRepo } from "./infrastructure/repos/risk.event.repo";
import CredentialRepo from "../user/repos/credential.repo";
import SessionRepository from "./infrastructure/repos/session.repo";
// import TrustedDeviceRepository from "./infrastructure/repos/trusted-device.repo";
import UserRepo from "./infrastructure/repos/user.repo";
import TrustedDeviceRepository from "@/security/infrastructure/repos/trustedDevice.repo";
import TrustedDeviceModel from "@/security/infrastructure/models/trusted.device.model";
import { UserClient } from "@/packages/user-sdk/src/client/user.client";
import { ProviderRegistry } from "./infrastructure/oauth/provider.registry";
import { GoogleProvider } from "./infrastructure/oauth/google.provider";

import { UserGateway } from "./infrastructure/gateways/user.gateway.impl";
import EvaluateRiskUseCase from "@/security/application/evaluateRisk.usecase";
import { ChallengeModel } from "./infrastructure/models/challenge.model";
import ChallengeRepo from "./infrastructure/repos/challenge.repo";
import { OAuthLoginUseCase } from "./application/usecases/login.usecase";
import { SessionService } from "./infrastructure/services/session.service";
import { IdentityRepository } from "./infrastructure/repos/identity.repo";
import { IdentityModel } from "./infrastructure/models/identity.model";

export default function registerAuthDependencies(container: DependencyContainer) {

  // ================= INFRA =================
  const redis = createRedis();

  container.register(TOKENS_INFRA.infra.redis, {
    useValue: redis,
  });

  container.register(TOKENS.security.blacklist, {
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
    useClass: GoogleProvider
  });

  container.register(TOKENS_AUTH.usecases.providerRegistry, {
    useFactory: (c) => new ProviderRegistry({
      google: c.resolve("GoogleProvider")
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

  container.register(TOKENS_AUTH.repos.challengeRepo, {
    useClass: ChallengeRepo
  });



  // ================= USECASES =================
  container.register(TOKENS_AUTH.usecases.oauthLoginUseCase, {
    useClass: OAuthLoginUseCase
  });

  container.register(TOKENS_AUTH.usecases.verifyOtpUseCase, {
    useClass: VerifyOtpUseCase
  });

  // ================= CLIENT =================
container.register(TOKENS_USER.userClient, {
  useFactory: () =>
    new UserClient(
      process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql"
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
container.register(TOKENS_AUTH.models.identityModel, {
  useValue: IdentityModel,
});

// ✅ 2. 再注册 repo
container.register(TOKENS_AUTH.repos.identityRepo, {
  useClass: IdentityRepository,
});
 // ================= models =================
 container.register(TOKENS_AUTH.models.challengeModel, {
  useValue: ChallengeModel,
});

  return container;
}
