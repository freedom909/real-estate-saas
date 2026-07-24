import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { MembershipRepository } from "../../infrastructure/repos/membership.repo";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";

@injectable()
export class SwitchTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private membershipRepo: MembershipRepository,
    @inject(TOKENS_TENANT.repos.tenantRepo)
    private tenantRepo: ITenantRepository
  ) {}

  async execute(input: { userId: string; tenantId: string }) {
    const { userId, tenantId } = input;

    // 1. Verify tenant exists and is active
    const tenant = await this.tenantRepo.findById(tenantId);
    if (!tenant) {
      throw new Error("Tenant not found");
    }
    if (tenant.status !== "ACTIVE") {
      throw new Error("Tenant is not active");
    }

    // 2. Verify user has a membership for this tenant
    const membership = await this.membershipRepo.findByUserAndTenant(userId, tenantId);
    if (!membership) {
      throw new Error("You do not have access to this tenant");
    }

    return {
      tenant: tenant.toJSON(),
      activeTenantId: tenantId,
    };
  }
}
