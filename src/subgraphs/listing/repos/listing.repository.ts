import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { ListingDocument, ListingModelToken } from '../models/listing.model';

@injectable()
export class ListingRepository {
  constructor(
    @inject(ListingModelToken) private model: Model<ListingDocument>
  ) {}

  async findById(id: string): Promise<ListingDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByTenantId(tenantId: string): Promise<ListingDocument[]> {
    return this.model.find({ tenantId }).exec();
  }

  async create(data: { name: string; address: string; tenantId: string }): Promise<ListingDocument> {
    return this.model.create(data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}