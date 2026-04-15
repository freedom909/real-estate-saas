import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';
import { Listing } from '../../domain/entities/Listing';

import { ListingMapper } from '../mappers/listing.mapper';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';
import Sequelize from 'sequelize/types/sequelize';
import ListingAmenityModel from '../models/listingAmenities.model';

@injectable()
export class ListingRepository implements IListingRepository {
  constructor(
    @inject(TOKENS_LISTING.ListingModel)
    private model: Model<Listing>,
    @inject(TOKENS_LISTING.ListingCategoryModel)
    private listingCategoryModel: Model<ListingCategoryModel>,
    @inject(TOKENS_LISTING.ListingAmenityModel)
    private listingAmenityModel: Model<ListingAmenityModel>,
    @inject(TOKENS_LISTING.Sequelize)
    private sequelize: Sequelize,
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

  // ✅ transaction（非常重要）
  const transaction = await this.sequelize.transaction();

  try {
    // ========================
    // 1. upsert 主表
    // ========================
    await this.model.upsert(raw, { transaction });

    // ========================
    // 2. 处理 categories（join table）
    // ========================
    if (listing.categories) {
      await this.listingCategoryModel.destroy({
        where: { listingId: listing.id },
        transaction,
      });

      await this.listingCategoryModel.bulkCreate(
        listing.categories.map((c) => ({
          listingId: listing.id,
          categoryId: c.id,
        })),
        { transaction }
      );
    }

    // ========================
    // 3. 处理 amenities（join table）
    // ========================
    if (listing.amenityIds) {
      await this.listingAmenityModel.destroy({
        where: { listingId: listing.id },
        transaction,
      });

      await this.listingAmenityModel.bulkCreate(
        listing.amenityIds.map((id) => ({
          listingId: listing.id,
          amenityId: id,
        })),
        { transaction }
      );
    }

    await transaction.commit();

    // ========================
    // 4. 返回 domain
    // ========================
    return listing;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
}