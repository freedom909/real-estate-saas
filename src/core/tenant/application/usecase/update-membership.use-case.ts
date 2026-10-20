//src/core/tenant/application/usecase/update-membership.use-case.ts

import { inject, injectable } from "tsyringe";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { Membership } from "../../domain/entities/membership";

export interface UpdateMembershipInput {
  actor: {
    userId: string;
    globalRole: GlobalRole;
  };
  membershipId: string;
  role?: MembershipRole;
  status?: Membership["status"];
}

@injectable()
export class UpdateMembershipUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: UpdateMembershipInput): Promise<Membership> {
    const { actor, membershipId, role, status } = input;

    if (!actor?.userId) {
      throw new Error("Unauthenticated");
    }

    if (role === undefined && status === undefined) {
      throw new Error("At least one membership field must be provided");
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
        throw new Error("Only platform administrators or an active tenant owner can update memberships");
      }

      if (actor.userId === target.userId) {
        throw new Error("You cannot manage your own membership");
      }

      if (target.role === MembershipRole.OWNER) {
        throw new Error("Tenant owners cannot manage another OWNER membership");
      }

      if (role === MembershipRole.OWNER) {
        throw new Error("Tenant owners cannot grant the OWNER role");
      }
    }

    if (role !== undefined) target.role = role;
    if (status !== undefined) target.status = status;

    return this.membershipRepo.save(target);
  }
}