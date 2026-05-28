import { injectable, inject } from 'tsyringe';
import { BillingRepository } from '../repositories/billing.repository';
import { HostAdapter } from '../adapters/host.adapter';
import { BillingAccountDocument } from '../models/billing.model';

@injectable()
export class BillingService {
  constructor(
    @inject(BillingRepository) private repo: BillingRepository,
    @inject(HostAdapter) private hostAdapter: HostAdapter
  ) {}

  async getBillingAccount(id: string): Promise<BillingAccountDocument | null> {
    return this.repo.findById(id);
  }

  async getAccountByHost(hostId: string): Promise<BillingAccountDocument | null> {
    return this.repo.findByHostId(hostId);
  }

  async createAccount(hostId: string): Promise<BillingAccountDocument> {
    const exists = await this.hostAdapter.validateHostExists(hostId);
    if (!exists) {
      throw new Error(`Host ${hostId} not found`);
    }
    // Check if already exists
    const existing = await this.repo.findByHostId(hostId);
    if (existing) return existing;
    
    return this.repo.create(hostId);
  }

  async addCredit(accountId: string, amount: number): Promise<BillingAccountDocument | null> {
    return this.repo.updateBalance(accountId, amount);
  }
}