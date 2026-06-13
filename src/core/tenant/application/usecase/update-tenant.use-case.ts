import { injectable, inject } from "tsyringe";

import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

@injectable()
export class UpdateTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo) private repo: ITenantRepository
  ) {}

  async execute(input: { tenantId: string; name: string }) {
    const tenant = await this.repo.findById(input.tenantId);
    if (!tenant) throw new Error("Tenant not found");

    tenant.rename(input.name);

    const updated = await this.repo.update(tenant);
    return updated.toJSON();
  }
}