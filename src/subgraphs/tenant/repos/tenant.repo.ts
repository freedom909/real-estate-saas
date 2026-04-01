import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { TenantDocument } from '../models/tenant.model';
import { TOKENS_TENANT } from '@/modules/tenant/container/tenant.tokens';


@injectable()
export class TenantRepository {
  constructor(
    @inject(TOKENS_TENANT.models.tenant) private model: Model<TenantDocument>
  ) {}

  async findById(id: string): Promise<TenantDocument | null> {
    return this.model.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<TenantDocument | null> {
    return this.model.findOne({ slug }).exec();
  }

  async create(data: { name: string; slug: string }): Promise<TenantDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<TenantDocument>): Promise<TenantDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findAllTenants(): Promise<TenantDocument[]> {
    return this.model.find().exec();
  }

  async findByIds(ids: string[]): Promise<TenantDocument[]> {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

}