// src/subgraphs/user/application/usecase/becomeHost.usecase.ts

import { inject, injectable } from "tsyringe";

import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

import { IUserRepository } from "../../domain/repository/IUserRepository";
import { UserEntity } from "../../domain/entities/user.entity";

import { IMembershipRepository } from "@/core/tenant/domain/repos/i-membership.repository";
import { MembershipRole } from "@/core/shared/domain/role";

@injectable()
export class BecomeHostUseCase {
  constructor(
    @inject(TOKENS_USER.repos.userRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepository: IMembershipRepository,
  ) {}

  async execute(
    userId: string,
    tenantId?: string | null,
  ): Promise<UserEntity> {
    console.log("🔥 [BecomeHost] searching user:", userId);

    const user = await this.userRepository.findById(userId);

    console.log("🔥 [BecomeHost] found user:", user);

    if (!user) {
      throw new Error("User not found");
    }

    if (!tenantId) {
      throw new Error("Active tenant is required to become a host");
    }

    const membership =
      await this.membershipRepository.findActiveByUserAndTenant(
        userId,
        tenantId,
      );

    if (!membership) {
      throw new Error("You do not have access to this tenant");
    }

    membership.role = MembershipRole.HOST;

    await this.membershipRepository.save(membership);

    return user;
  }
}