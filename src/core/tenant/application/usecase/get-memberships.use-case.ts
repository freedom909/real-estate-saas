import { inject, injectable } from "tsyringe";
import {
  GlobalRole,
  MembershipRole,
} from "@/core/shared/domain/role";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { Membership } from "../../domain/entities/membership";

export interface GetMembershipsInput {
  actor: {
    userId: string;
    globalRole: GlobalRole;
  };
  tenantId: string;
  userId?: string;
  role?: MembershipRole;
  status?: Membership["status"];
  limit?: number;
  offset?: number;
}

@injectable()
export class GetMembershipsUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: GetMembershipsInput) {
    const { actor, tenantId } = input;

    if (!actor?.userId) {
      throw new Error("Unauthenticated");
    }

    if (!tenantId) {
      throw new Error("tenantId is required");
    }

    const isPlatformAdmin =
      actor.globalRole === GlobalRole.ADMIN ||
      actor.globalRole === GlobalRole.SUPER_ADMIN;

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
          "Only platform administrators or an active tenant owner can list memberships",
        );
      }
    }

    const result = await this.membershipRepo.findByTenantId(tenantId, {
      userId: input.userId,
      role: input.role,
      status: input.status,
      limit: input.limit,
      offset: input.offset,
    });

    return {
      items: result.items,
      pageInfo: {
        total: result.total,
        hasNextPage:
          Math.max(input.offset ?? 0, 0) +
            result.items.length <
          result.total,
      },
    };
  }
}
