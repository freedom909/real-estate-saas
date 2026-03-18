import { injectable, inject } from 'tsyringe';
import { PropertyRepository } from '../repositories/property.repository';
import { TenantAdapter } from '../adapters/tenant.adapter';
import { PropertyDocument } from '../models/property.model';

@injectable()
export class PropertyService {
  constructor(
    @inject(PropertyRepository) private repo: PropertyRepository,
    @inject(TenantAdapter) private tenantAdapter: TenantAdapter
  ) {}

  async getProperty(id: string): Promise<PropertyDocument | null> {
    return this.repo.findById(id);
  }

  async getPropertiesByTenant(tenantId: string): Promise<PropertyDocument[]> {
    return this.repo.findByTenantId(tenantId);
  }

  async createProperty(input: { tenantId: string; name: string; address: string }): Promise<PropertyDocument> {
    const tenantExists = await this.tenantAdapter.validateTenantExists(input.tenantId);
    if (!tenantExists) {
      throw new Error(`Tenant ${input.tenantId} does not exist`);
    }
    return this.repo.create(input);
  }
}