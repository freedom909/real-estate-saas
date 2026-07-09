import { injectable, inject } from 'tsyringe';
import { BillingRepository } from '../repositories/billing.repository';
import { TenantAdapter } from '../adapters/tenant.adapter';
import { BillingAccountDocument } from '../models/billing.model';

@injectable()
export class BillingService {
  constructor(
    @inject(BillingRepository) private repo: BillingRepository,
    @inject(TenantAdapter) private tenantAdapter: TenantAdapter
  ) {}

  async getBillingAccount(id: string): Promise<BillingAccountDocument | null> {
    return this.repo.findById(id);
  }

  async getAccountByTenant(tenantId: string): Promise<BillingAccountDocument | null> {
    return this.repo.findByTenantId(tenantId);
  }

  async createAccount(tenantId: string): Promise<BillingAccountDocument> {
    const exists = await this.tenantAdapter.validateTenantExists(tenantId);
    if (!exists) {
      throw new Error(`Tenant ${tenantId} not found`);
    }
    // Check if already exists
    const existing = await this.repo.findByTenantId(tenantId);
    if (existing) return existing;
    
    return this.repo.create(tenantId);
  }

  async addCredit(accountId: string, amount: number): Promise<BillingAccountDocument | null> {
    return this.repo.updateBalance(accountId, amount);
  }
}