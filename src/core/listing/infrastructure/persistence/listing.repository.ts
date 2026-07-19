//src/subgraphs/listing/infrastructure/persistence/listing.repository.ts
import { injectable, inject } from 'tsyringe';

import { ListingMapper } from '../mappers/listing.mapper';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository, SearchListingsQuery } from '../../domain/entities/IListingRepository';
import { Sequelize } from 'sequelize';
import ListingModel from '../models/listing.model';
import ListingCategories from '../models/listingCategories.model';
import ListingAmenity from '../models/listingAmenities.model';

import { Op } from 'sequelize';
import Category from '../models/category.model';
import CategoryModel from '@/shared/category/infrastructure/category.model';
import { Listing } from '../../domain/entities/listing';

@injectable()
export class ListingRepository implements IListingRepository {
  constructor(
    @inject(TOKENS_LISTING.models.listingModel)
    private model: typeof ListingModel,
    @inject(TOKENS_LISTING.models.listingCategoriesModel)
    private listingCategoryModel: typeof ListingCategories,
    @inject(TOKENS_LISTING.models.listingAmenityModel)
    private listingAmenityModel: typeof ListingAmenity,
    @inject(TOKENS_LISTING.sequelize)
    private sequelize: Sequelize,
  ) {}

  findAll(): Promise<Listing[]> {
    return this.model.findAll().then(records => records.map(record => ListingMapper.toDomain(record)));
  }

  async create(listing: Listing): Promise<Listing> {
    const persistence = ListingMapper.toPersistence(listing);
    const created = await this.model.create(persistence);
    return ListingMapper.toDomain(created);
  }

  async update(id: string, listing: Listing): Promise<boolean> {
    const raw = ListingMapper.toPersistence(listing);
    const [affectedCount] = await this.model.update(raw as any, { where: { id } });
    return affectedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.model.destroy({ where: { id } });
    return deletedCount > 0;
  }

  async findById(id: string): Promise<Listing | null> {
    const listing = await this.model.findByPk(id);
    if (!listing) {
      return null;
    }

    const categoryRows = await this.listingCategoryModel.findAll({
      where: { listingId: id }
    });

    const categories = categoryRows.map((c: any) => c.categoryId);

    const amenityRows = await this.listingAmenityModel.findAll({
      where: { listingId: id }
    });

    const amenityIds = amenityRows.map((a: any) => a.amenityId);

    const domain = ListingMapper.toDomain({
      ...listing.toJSON(),
      categories,
      amenityIds,
    });
    return domain;
  }

  async findByOwnerId(ownerId: string): Promise<Listing[]> {
    const records = await this.model.findAll({ where: { ownerId: ownerId } });
    return records.map(record => ListingMapper.toDomain(record));
  }

  async search(query: SearchListingsQuery): Promise<Listing[]> {
    const where: any = {};

    // Filter by location (address OR title contains keyword)
    if (query.location) {
      where[Op.or] = [
        { address: { [Op.like]: `%${query.location}%` } },
        { title: { [Op.like]: `%${query.location}%` } },
      ];
    }

    // Filter by customer count
    if (query.customerCount) {
      where.numOfCustomers = { [Op.gte]: query.customerCount };
    }

    // Filter by price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) {
        where.price[Op.gte] = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.price[Op.lte] = query.maxPrice;
      }
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const records = await this.model.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    // Batch-load categories for all returned listing IDs
    // (listing_categories is a join table, not a column on listings)
    const listingIds = records.map((r: any) => r.id);
    const categoryRows = listingIds.length > 0
      ? await this.listingCategoryModel.findAll({ where: { listingId: listingIds } })
      : [];
    const categoryMap = new Map<string, string[]>();
    for (const row of categoryRows as any[]) {
      const list = categoryMap.get(row.listingId) || [];
      list.push(row.categoryId);
      categoryMap.set(row.listingId, list);
    }

    return records.map(record => {
      const json = record.toJSON();
      return ListingMapper.toDomain({
        ...json,
        categories: categoryMap.get(json.id) ?? [],
        amenityIds: json.amenityIds ?? [],
      });
    });
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    return CategoryModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }

  async save(listing: Listing): Promise<Listing> {
    const raw = ListingMapper.toPersistence(listing);
    const transaction = await this.sequelize.transaction();

    try {
      // 1. Upsert main Listing table
      await this.model.upsert(raw as any, { transaction });

      // 2. Handle categories join table
      const categoryIds = listing.categories || [];
      
      await this.listingCategoryModel.destroy({
        where: { listingId: listing.id },
        transaction,
      });

      if (categoryIds.length > 0) {
        await this.listingCategoryModel.bulkCreate(
          categoryIds.map((catId: string) => ({
            listingId: listing.id,
            categoryId: catId,
          })),
          { transaction }
        );
      }

      // 3. Handle amenities join table
      const amenityIds = (listing as any).amenityIds || [];
      
      await this.listingAmenityModel.destroy({
        where: { listingId: listing.id },
        transaction,
      });

      if (amenityIds.length > 0) {
        await this.listingAmenityModel.bulkCreate(
          amenityIds.map((amId: number) => ({
            listingId: listing.id,
            amenityId: amId,
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return listing;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
