import { injectable, inject } from 'tsyringe';
import { ListingRepository } from '../repos/listing.repository';

import { ListingDocument } from '../models/listing.model';
import { TOKENS_Listing } from '@/modules/property/container/property.tokens';
import { TOKENS_TENANT } from '@/modules/tenant/container/tenant.tokens';
import { TenantAdapter } from '../adapters/tenant.adapter';

@injectable()
export class ListingService {
  constructor(
    @inject(TOKENS_Listing.ListingRepo)
    private repo: ListingRepository,

    @inject(TOKENS_Listing.tenantAdapter)
    private tenantAdapter: TenantAdapter
  ) {}

  async getListing(id: string): Promise<ListingDocument | null> {
    return this.repo.findById(id);
  }

  async getPropertiesByTenant(tenantId: string): Promise<ListingDocument[]> {
    return this.repo.findByTenantId(tenantId);
  }

  async createListing(input: {
    tenantId: string;
    name: string;
    address: string;
  }): Promise<ListingDocument> {
    const tenantExists = await this.tenantAdapter.validateTenantExists(input.tenantId);

    if (!tenantExists) {
      throw new Error(`Tenant ${input.tenantId} does not exist`);
    }

    return this.repo.create(input);
  }
}