import { injectable, inject } from "tsyringe";

import { ITenantRepository } from "../../domain/repos/i-tenant.repository";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

@injectable()
export class ListTenantsUseCase {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo) private repo: ITenantRepository
  ) {}

  async execute(filter: any) {
    const limit = filter.limit || 10;
    const offset = filter.offset || 0;

    const result = await this.repo.paginate({ ...filter, limit, offset });
    return {
      items: result.items.map(i => i.toJSON()),
      pageInfo: { total: result.total, hasNextPage: (offset + limit) < result.total }
    };
  }
}