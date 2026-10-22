import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";
import { IMembershipRepository } from "../../domain/repos/i-membership.repository";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { TenantStatus } from "../../domain/entities/tenant.entity";

@injectable()
export class GetMyTenantsUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo)
    private readonly membershipRepo: IMembershipRepository,

    @inject(TOKENS_TENANT.repos.tenantRepo)
    private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(userId: string) {
    if (!userId) {
      throw new Error("Unauthenticated");
    }

    const memberships = await this.membershipRepo.findByUserId(userId);

    const activeTenantIds = [
      ...new Set(
        memberships
          .filter((membership) => membership.status === "ACTIVE")
          .map((membership) => membership.tenantId),
      ),
    ];

    if (activeTenantIds.length === 0) {
      return [];
    }

    const tenants = await this.tenantRepo.findByIds(activeTenantIds);

    return tenants
      .filter((tenant) => tenant.status === TenantStatus.ACTIVE)
      .map((tenant) => tenant.toJSON());
  }
}
