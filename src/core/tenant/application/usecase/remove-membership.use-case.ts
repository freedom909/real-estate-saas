// =========================================================
//src/core/tenant/application/usecase/remove-membership.use-case.ts

import { inject, injectable } from "tsyringe";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { Membership } from "../../domain/entities/membership";

export interface RemoveMembershipInput {
  actor: {
    userId: string;
    globalRole: GlobalRole;
  };
  membershipId: string;
}

@injectable()
export class RemoveMembershipUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: RemoveMembershipInput): Promise<Membership> {
    const { actor, membershipId } = input;

    if (!actor?.userId) {
      throw new Error("Unauthenticated");
    }

    const isPlatformAdmin =
      actor.globalRole === GlobalRole.ADMIN ||
      actor.globalRole === GlobalRole.SUPER_ADMIN;

    const target = await this.membershipRepo.findById(membershipId);

    if (!target) {
      throw new Error("Membership not found");
    }

    if (!isPlatformAdmin) {
      const actorMembership =
        await this.membershipRepo.findActiveByUserAndTenant(
          actor.userId,
          target.tenantId,
        );

      if (
        !actorMembership ||
        actorMembership.role !== MembershipRole.OWNER
      ) {
        throw new Error("Only platform administrators or an active tenant owner can remove memberships");
      }

      if (actor.userId === target.userId) {
        throw new Error("You cannot remove your own membership");
      }

      if (target.role === MembershipRole.OWNER) {
        throw new Error("Tenant owners cannot remove another OWNER membership");
      }
    }

    target.status = "REMOVED";
    return this.membershipRepo.save(target);
  }
}