// =========================================================
// Create Membership Use Case
// =========================================================
//src/core/tenant/application/usecase/create-membership.use-case.ts


import { injectable, inject } from "tsyringe";

import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { Membership } from "../../domain/entities/membership";
import { TenantStatus } from "../../domain/entities/tenant.entity";
import { GlobalRole, MembershipRole } from "@/core/shared/domain/role";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

export interface CreateMembershipInput {
  actor: {
    userId: string;
    globalRole: GlobalRole;
  };
  status: TenantStatus;
  tenantId: string;
  userId: string;
  role: MembershipRole;
}

@injectable()
export class CreateMembershipUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo)
    private readonly tenantRepo: ITenantRepository,

    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: CreateMembershipInput) {
    const { actor, tenantId, userId, role } = input;

    if (!actor?.userId) {
      throw new Error("Unauthenticated");
    }

    const isPlatformAdmin =
      actor.globalRole === GlobalRole.ADMIN ||
      actor.globalRole === GlobalRole.SUPER_ADMIN;

    const tenant = await this.tenantRepo.findById(tenantId);

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    if (tenant.status !== TenantStatus.ACTIVE) {
      throw new Error("Only ACTIVE tenants can accept memberships");
    }

    // Tenant owners may not grant OWNER to another account.
    if (!isPlatformAdmin && role === MembershipRole.OWNER) {
      throw new Error("Tenant owners cannot grant the OWNER role");
    }

    // Non-admins cannot create or manage their own membership.
    if (!isPlatformAdmin && actor.userId === userId) {
      throw new Error("You cannot create your own membership");
    }

    if (!isPlatformAdmin) {
      const actorMembership =
        await this.membershipRepo.findActiveByUserAndTenant(
          actor.userId,
          tenantId,
        );

      if (
        !actorMembership ||
        actorMembership.role !== MembershipRole.OWNER
      ) {
        throw new Error(
          "Only platform administrators or an active tenant owner can create memberships",
        );
      }
    }

    // Never allow creation to silently overwrite an existing membership.
    const existingMembership =
      await this.membershipRepo.findByUserAndTenant(userId, tenantId);

    if (existingMembership) {
      throw new Error("Membership already exists");
    }

    const membership = new Membership(
      null,
      userId,
      tenantId,
      role,
      "ACTIVE",
    );

    return this.membershipRepo.create(membership);
  }
}
