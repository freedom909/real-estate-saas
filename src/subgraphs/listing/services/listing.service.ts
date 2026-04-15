import { injectable, inject } from 'tsyringe';

import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { TenantAdapter } from '../adapters/tenant.adapter';
import { ListingRepository } from '../infrastructure/persistence/listing.repository';
import { Listing } from '../domain/entities/Listing';

@injectable()
export class ListingService {
  constructor(
    @inject(TOKENS_LISTING.ListingRepository)
    private repo: ListingRepository,

    @inject(TOKENS_LISTING.tenantAdapter)
    private tenantAdapter: TenantAdapter
  ) {}

  async getListing(id: string): Promise<Listing | null> {
    return this.repo.findById(id);
  }

  async getPropertiesByTenant(tenantId: string): Promise<Listing[]> {
    return this.repo.findByTenantId(tenantId);
  }

  async createListing(input: {
    tenantId: string;
    title: string;
    description?: string;
    address: string;
    categories: string[];
    amenityIds?: string[];
  }): Promise<Listing> {
    const tenant = await this.tenantAdapter.validateTenantExists(input.tenantId);

    if (!tenant) {
      throw new Error(`Tenant ${input.tenantId} does not exist`);
    }

    const listing = new Listing(input);
    return this.repo.save(listing);
  }
}