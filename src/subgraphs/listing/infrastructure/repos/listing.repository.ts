import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { Listing } from '../../domain/entities/listing';

import { ListingMapper } from '../mappers/listing.mapper';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';

@injectable()
export class ListingRepository implements IListingRepository {
  constructor(
    @inject(TOKENS_LISTING.ListingModel)
    private model: Model<Listing>
  ) {}
  create(listing: Listing): Promise<Listing> {
    throw new Error('Method not implemented.');
  }
  update(id: string, listing: Listing): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  delete(id: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async findById(id: string): Promise<Listing | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? ListingMapper.toDomain(doc) : null;
  }

  async findByTenantId(tenantId: string): Promise<Listing[]> {
    const docs = await this.model.find({ tenantId }).exec();
    return docs.map(doc => ListingMapper.toDomain(doc));
  }

  async save(listing: Listing): Promise<Listing> {
    const raw = ListingMapper.toPersistence(listing);
    const doc = await this.model.findOneAndUpdate(
      { _id: raw._id },
      raw,
      { upsert: true, new: true }
    ).exec();
    return ListingMapper.toDomain(doc as Listing);
  }
}