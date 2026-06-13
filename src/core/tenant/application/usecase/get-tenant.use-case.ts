import { injectable, inject } from "tsyringe";

import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

@injectable()
export class GetTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo) 
    private repo: ITenantRepository
  ) {}

  async execute(id: string) {
    const tenant = await this.repo.findById(id);
    if (!tenant) return null;
    
    return tenant.toJSON();
  }
}