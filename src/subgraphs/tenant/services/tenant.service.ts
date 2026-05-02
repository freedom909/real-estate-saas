import { injectable, inject } from 'tsyringe';
import { HostRepository } from '../repos/host.repo';
import { HostDocument } from '../models/host.model';
import { MembershipDocument } from '../models/membership.model';
import { MembershipRepository } from '../repos/membership.repo';
import { TOKENS_Host } from '@/modules/tokens/host.tokens';
import { UserAdapter } from './user.adapter';

@injectable()
export class HostService {
  constructor(
    @inject(TOKENS_Host.repos.hostRepo) private repo: HostRepository,
    // Using UserAdapter instead of UserRepository to follow DDD Bounded Context / ACL patterns
    @inject(TOKENS_Host.adapters.userAdapter) private userAdapter: UserAdapter,
    @inject(TOKENS_Host.repos.membershipRepo) private membershipRepo: MembershipRepository
  ) {}

  async getHost(id: string): Promise<HostDocument | null> {
    return this.repo.findById(id);
  }

  async getHostBySlug(slug: string): Promise<HostDocument | null> {
    return this.repo.findBySlug(slug);
  }

  async createHost(input: { name: string; slug: string }): Promise<HostDocument> {
    return this.repo.create(input);
  }

  async getHostsForUser(userId: string): Promise<HostDocument[]> {
    if (!userId) {
      return [];
    }
    const user = await this.userAdapter.getUserById(userId);
    if (!user) return [];
    const memberships = await this.membershipRepo.findByUserId(user._id.toString());
    
    const hostIds = memberships.map((m: MembershipDocument) => m.hostId);
    return this.repo.findByIds(hostIds.map((id) => id.toString()));
  }

  async getHostsAll(): Promise<HostDocument[]> {
    return this.repo.findAllHosts(); 
  }

}