import { injectable, inject } from 'tsyringe';
import { PropertyRepository } from '../repos/property.repository';

import { PropertyDocument } from '../models/property.model';
import { TOKENS_PROPERTY } from '@/modules/property/container/property.tokens';
import { TOKENS_TENANT } from '@/modules/tenant/container/tenant.tokens';
import { TenantAdapter } from '../adapters/tenant.adapter';

@injectable()
export class PropertyService {
  constructor(
    @inject(TOKENS_PROPERTY.propertyRepo)
    private repo: PropertyRepository,

    @inject(TOKENS_PROPERTY.tenantAdapter)
    private tenantAdapter: TenantAdapter
  ) {}

  async getProperty(id: string): Promise<PropertyDocument | null> {
    return this.repo.findById(id);
  }

  async getPropertiesByTenant(tenantId: string): Promise<PropertyDocument[]> {
    return this.repo.findByTenantId(tenantId);
  }

  async createProperty(input: {
    tenantId: string;
    name: string;
    address: string;
  }): Promise<PropertyDocument> {
    const tenantExists = await this.tenantAdapter.validateTenantExists(input.tenantId);

    if (!tenantExists) {
      throw new Error(`Tenant ${input.tenantId} does not exist`);
    }

    return this.repo.create(input);
  }
}