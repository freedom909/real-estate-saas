import { injectable, inject } from "tsyringe";
import { TOKENS_TENANT } from "../../domain/entities/tenant.tokens";
import { ITenantRepository } from "../../domain/repos/i-tenant.repository";

@injectable()
export class GetTenantUseCase {
  constructor(
    @inject(TOKENS_TENANT.repositories.tenantRepo) 
    private repo: ITenantRepository
  ) {}

  async execute(id: string) {
    const tenant = await this.repo.findById(id);
    if (!tenant) return null;
    
    return tenant.toJSON();
  }
}