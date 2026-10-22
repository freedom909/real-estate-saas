import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";

interface Actor {
  userId: string;
  globalRole: string;
}

@injectable()
export class GetMembershipUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: { actor: Actor; membershipId: string }) {
    const { actor, membershipId } = input;

    if (!actor?.userId) {
      throw new Error("Unauthenticated");
    }

    if (!membershipId) {
      throw new Error("Membership ID is required");
    }

    const membership = await this.membershipRepo.findById(membershipId);

    if (!membership) {
      return null;
    }

    // Platform administrators may read memberships across tenants.
    if (
      actor.globalRole === "ADMIN" ||
      actor.globalRole === "SUPER_ADMIN"
    ) {
      return membership;
    }

    // A user may read their own membership.
    if (membership.userId === actor.userId) {
      return membership;
    }

    // Other memberships require an active OWNER membership
    // in the same tenant.
    const actorMembership =
      await this.membershipRepo.findActiveByUserAndTenant(
        actor.userId,
        membership.tenantId,
      );

    if (actorMembership?.role !== "OWNER") {
      throw new Error("Forbidden");
    }

    return membership;
  }
}
