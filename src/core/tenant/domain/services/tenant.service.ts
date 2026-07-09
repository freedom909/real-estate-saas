import { injectable, inject } from 'tsyringe';

import { UserAdapter } from '../../adapter/user.adapter';
import { TenantRepository } from '../../infrastructure/repos/tenant.repo';
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { MembershipRepository } from '../../infrastructure/repos/membership.repo';
import { TenantDocument } from '../../infrastructure/models/tenant.model';
import { MembershipDocument } from '../../infrastructure/models/membership.model';

@injectable()
export class TenantService {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo) private repo: TenantRepository,
    // Using UserAdapter instead of UserRepository to follow DDD Bounded Context / ACL patterns
    @inject(TOKENS_TENANT.adapters.userAdapter) private userAdapter: UserAdapter,
    @inject(TOKENS_TENANT.repos.membershipRepo) private membershipRepo: MembershipRepository
  ) {}

  async getTenant(id: string): Promise<TenantDocument | null> {
    return this.repo.findById(id);
  }

  async getTenantBySlug(slug: string): Promise<TenantDocument | null> {
    return this.repo.findBySlug(slug);
  }

  async createTenant(input: { name: string; slug: string }): Promise<TenantDocument> {
    return this.repo.create(input);
  }

  async getTenantsForUser(userId: string): Promise<TenantDocument[]> {
    if (!userId) {
      return [];
    }
    const user = await this.userAdapter.getUserById(userId);
    if (!user) return [];
    const memberships = await this.membershipRepo.findByUserId(user.id.toString());
    
    const hostIds = memberships.map((m: MembershipDocument) => m.hostId);
    return this.repo.findByIds(hostIds.map((id) => id.toString()));
  }

  async getTenantsAll(): Promise<TenantDocument[]> {
    return this.repo.findAllTenants(); 
  }

}