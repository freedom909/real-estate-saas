import { injectable, inject } from 'tsyringe';
import { TenantRepository } from '../repos/tenant.repo';
import { TenantDocument } from '../models/tenant.model';
import { MembershipDocument } from '../models/membership.model';
import  UserRepository  from '../../user/repos/user.repo';
import { MembershipRepository } from '../repos/membership.repo';

@injectable()
export class TenantService {
  constructor(
    private repo: TenantRepository,
    private userRepo: UserRepository,
    private membershipRepo: MembershipRepository
  ) {}

  async getTenant(id: string): Promise<TenantDocument | null> {
    return this.repo.findById(id);
  }

  async getTenantBySlug(slug: string): Promise<TenantDocument | null> {
    return this.repo.findBySlug(slug);
  }

  async createTenant(input: { name: string; slug: string }): Promise<TenantDocument> {
    // Business logic: check if slug exists, validate name, etc.
    // For now, we rely on DB unique constraint for slug.
    return this.repo.create(input);
  }

async getTenantsForUser(userId: string): Promise<TenantDocument[]> {
  if(!userId) {
    return [];
  }
const user = await this.userRepo.findById(userId);
const memberships = await this.membershipRepo.findByUserId(user.id);
const tenantIds = memberships.map((m: MembershipDocument) => m.tenantId);
return this.repo.findByIds();
}

  async getTenantsAll(): Promise<TenantDocument[]> {
    return this.repo.findAllTenants(); 
  }

}