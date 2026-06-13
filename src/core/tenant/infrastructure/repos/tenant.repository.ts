import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { TenantDocument } from '../models/tenant.model';

import { ITenantRepository, TenantPaginationResult } from '../../domain/repos/i-tenant.repository';
import { Tenant, TenantStatus } from '../../domain/entities/tenant.entity';
import { TOKENS_TENANT } from '@/modules/tokens/tenant.tokens';

@injectable()
export class TenantRepository implements ITenantRepository {
  constructor(
    @inject(TOKENS_TENANT.models.tenant) private model: Model<TenantDocument>
  ) {}

  private toDomain(doc: TenantDocument): Tenant {
    return new Tenant({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      status: doc.status as TenantStatus,
      ownerUserId: doc.ownerUserId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  async findById(id: string): Promise<Tenant | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const doc = await this.model.findOne({ slug }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async save(tenant: Tenant): Promise<Tenant> {
    const doc = await this.model.create(tenant.toJSON());
    return this.toDomain(doc);
  }

  async update(tenant: Tenant): Promise<Tenant> {
    const doc = await this.model.findByIdAndUpdate(
      tenant.id,
      { name: tenant.name, status: tenant.status },
      { new: true }
    ).exec();
    if (!doc) throw new Error("Tenant not found");
    return this.toDomain(doc);
  }

  async findAll(): Promise<Tenant[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async paginate(filter: any): Promise<TenantPaginationResult> {
    const query: any = {};
    if (filter.keyword) query.name = new RegExp(filter.keyword, 'i');
    if (filter.status) query.status = filter.status;

    const limit = filter.limit || 10;
    const offset = filter.offset || 0;

    const [items, total] = await Promise.all([
      this.model.find(query).limit(limit).skip(offset).exec(),
      this.model.countDocuments(query).exec()
    ]);

    return { items: items.map(d => this.toDomain(d)), total };
  }
}