// src/subgraphs/user/registerUserDependencies.ts

import { DependencyContainer } from "tsyringe";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { TOKENS_INFRA } from "@/modules/tokens/infra.tokens";

import UserService from "./services/user.service";
import userModel from "./infra/models/user.model";
import { UserRepository } from "./infra/repos/user.repo";
import { BecomeHostUseCase } from "./application/usecase/becomeHost.usecase";
import CreateOAuthUserUseCase from "./application/usecase/createOAuthUserUseCase";

import RedisService from "@/infrastructure/redis/redisService";
import { UserClient } from "@/packages/user-sdk/src";
import { TenantService } from "@/core/tenant/domain/services/tenant.service";
import { TenantRepository } from "@/core/tenant/infrastructure/repos/tenant.repository";
import { MembershipRepository } from "@/core/tenant/infrastructure/repos/membership.repo";
import { TenantModel } from "@/core/tenant/infrastructure/models/tenant.model";
import MembershipModel from "@/core/tenant/infrastructure/models/membership.model";
import { UserAdapter } from "@/core/tenant/adapter/user.adapter";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { ProfileServiceUseCase } from "./application/usecase/profileService.usercase";

export function registerUserDependencies(container: DependencyContainer) {
  // ── Models ─────────────────────────────────────────
  container.register(TOKENS_USER.models.user, { useValue: userModel });

  // ── Repository (single DDD token) ──────────────────
  container.register(TOKENS_USER.repos.userRepository, { useClass: UserRepository });

  // ── Use Cases ──────────────────────────────────────
  container.register(TOKENS_USER.usecase.becomeHostUseCase, { useClass: BecomeHostUseCase });
  container.register(TOKENS_USER.usecase.createOAuthUserUseCase, { useClass: CreateOAuthUserUseCase });
  container.register(TOKENS_USER.usecase.profileServiceUseCase, { useClass: ProfileServiceUseCase });

  // ── Service ────────────────────────────────────────
  container.register(TOKENS_USER.services.userService, { useClass: UserService });

  // ── Infrastructure ─────────────────────────────────
  container.register(TOKENS_INFRA.infra.redis, { useValue: RedisService });

  container.register(TOKENS_USER.userClient, {
    useFactory: () => new UserClient(
      process.env.USER_SUBGRAPH_URL || "http://localhost:4020/graphql"
    ),
  });

  // ── Tenant dependencies (for tenantsByUser resolver) ──
  container.register(TOKENS_TENANT.models.tenant, { useValue: TenantModel });
  container.register(TOKENS_TENANT.models.membership, { useValue: MembershipModel });
  container.register(TOKENS_TENANT.repos.tenantRepo, { useClass: TenantRepository });
  container.register(TOKENS_TENANT.repos.membershipRepo, { useClass: MembershipRepository });
  container.register(TOKENS_TENANT.adapters.userAdapter, { useClass: UserAdapter });
  container.register(TOKENS_TENANT.services.tenantService, { useClass: TenantService });

  return container;
}
