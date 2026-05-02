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

  async findByHostId(hostId: string): Promise<BillingAccountDocument | null> {
    return this.model.findOne({ hostId }).exec();
  }

  async create(hostId: string): Promise<BillingAccountDocument> {
    return this.model.create({ hostId });
  }

  async updateBalance(id: string, amount: number): Promise<BillingAccountDocument | null> {
    return this.model.findByIdAndUpdate(id, { $inc: { balance: amount } }, { new: true }).exec();
  }
}