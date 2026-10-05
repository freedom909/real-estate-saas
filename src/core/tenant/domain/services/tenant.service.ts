// src/core/tenant/domain/services/tenant.service.ts


import { injectable, inject } from 'tsyringe';

import { UserAdapter } from '../../adapter/user.adapter';
import { ITenantRepository } from '../repos/i-tenant.repository';
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { IMembershipRepository } from '../repos/i-membership.repository';
import { Tenant } from '../entities/tenant.entity';
import { Membership } from '../entities/membership';

@injectable()
export class TenantService {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo)
    private repo: ITenantRepository,

    @inject(TOKENS_TENANT.adapters.userAdapter)
    private userAdapter: UserAdapter,

    @inject(TOKENS_TENANT.repos.membershipRepo)
    private membershipRepo: IMembershipRepository
  ) {}

  async getTenantsForUser(userId: string): Promise<Tenant[]> {
    if (!userId) {
      return [];
    }

    const user = await this.userAdapter.getUserById(userId);
    if (!user) {
      return [];
    }

    const memberships = await this.membershipRepo.findByUserId(
      user.id.toString()
    );

    const tenantIds = memberships.map(
      (membership: Membership) => membership.tenantId.toString()
    );

    return this.repo.findByIds(tenantIds);
  }
}

