import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { PropertyDocument, PropertyModelToken } from '../models/property.model';

@injectable()
export class PropertyRepository {
  constructor(
    @inject(PropertyModelToken) private model: Model<PropertyDocument>
  ) {}

  async findById(id: string): Promise<PropertyDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByTenantId(tenantId: string): Promise<PropertyDocument[]> {
    return this.model.find({ tenantId }).exec();
  }

  async create(data: { name: string; address: string; tenantId: string }): Promise<PropertyDocument> {
    return this.model.create(data);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}