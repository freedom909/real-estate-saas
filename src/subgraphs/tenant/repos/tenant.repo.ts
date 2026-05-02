import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { HostDocument } from '../models/host.model';
import { TOKENS_Host } from '@/modules/tokens/host.tokens';


@injectable()
export class HostRepository {
  constructor(
    @inject(TOKENS_Host.models.host) private model: Model<HostDocument>
  ) {}

  async findById(id: string): Promise<HostDocument | null> {
    return this.model.findById(id).exec();
  }

  async findBySlug(slug: string): Promise<HostDocument | null> {
    return this.model.findOne({ slug }).exec();
  }

  async create(data: { name: string; slug: string }): Promise<HostDocument> {
    return this.model.create(data);
  }

  async update(id: string, data: Partial<HostDocument>): Promise<HostDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async findAllHosts(): Promise<HostDocument[]> {
    return this.model.find().exec();
  }

  async findByIds(ids: string[]): Promise<HostDocument[]> {
    return this.model.find({ _id: { $in: ids } }).exec();
  }

}