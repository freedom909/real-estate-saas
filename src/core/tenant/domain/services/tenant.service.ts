import { injectable, inject } from 'tsyringe';

import { UserAdapter } from '../../adapter/user.adapter';
import { HostRepository } from '../../infrastructure/repos/tenant.repo';
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';
import { MembershipRepository } from '../../infrastructure/repos/membership.repo';
import { TenantDocument } from '../../infrastructure/models/tenant.model';
import { MembershipDocument } from '../../infrastructure/models/membership.model';

@injectable()
export class TenantService {
  constructor(
    @inject(TOKENS_TENANT.repos.tenantRepo) private repo: HostRepository,
    // Using UserAdapter instead of UserRepository to follow DDD Bounded Context / ACL patterns
    @inject(TOKENS_TENANT.adapters.userAdapter) private userAdapter: UserAdapter,
    @inject(TOKENS_TENANT.repos.membershipRepo) private membershipRepo: MembershipRepository
  ) {}

  async getHost(id: string): Promise<TenantDocument | null> {
    return this.repo.findById(id);
  }

  async getHostBySlug(slug: string): Promise<TenantDocument | null> {
    return this.repo.findBySlug(slug);
  }

  async createHost(input: { name: string; slug: string }): Promise<TenantDocument> {
    return this.repo.create(input);
  }

  async getHostsForUser(userId: string): Promise<TenantDocument[]> {
    if (!userId) {
      return [];
    }
    const user = await this.userAdapter.getUserById(userId);
    if (!user) return [];
    const memberships = await this.membershipRepo.findByUserId(user.id.toString());
    
    const hostIds = memberships.map((m: MembershipDocument) => m.hostId);
    return this.repo.findByIds(hostIds.map((id) => id.toString()));
  }

  async getHostsAll(): Promise<TenantDocument[]> {
    return this.repo.findAllHosts(); 
  }

}