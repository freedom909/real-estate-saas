import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { BillingAccountDocument, BillingAccountModelToken } from '../models/billing.model';

@injectable()
export class BillingRepository {
  constructor(
    @inject(BillingAccountModelToken) private model: Model<BillingAccountDocument>
  ) {}

  async findById(id: string): Promise<BillingAccountDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByTenantId(tenantId: string): Promise<BillingAccountDocument | null> {
    return this.model.findOne({ tenantId }).exec();
  }

  async create(tenantId: string): Promise<BillingAccountDocument> {
    return this.model.create({ tenantId });
  }

  async updateBalance(id: string, amount: number): Promise<BillingAccountDocument | null> {
    return this.model.findByIdAndUpdate(id, { $inc: { balance: amount } }, { new: true }).exec();
  }
}