import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";

@injectable()
export class GetMyMembershipUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,
  ) {}

  async execute(input: { userId: string; tenantId: string }) {
    const { userId, tenantId } = input;

    if (!userId) {
      throw new Error("Unauthenticated");
    }

    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    return this.membershipRepo.findByUserAndTenant(userId, tenantId);
  }
}
