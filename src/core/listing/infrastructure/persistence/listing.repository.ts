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
import { PictureModel } from '../models/picture.model';
import PictureMapper from '../mappers/picture.mapper';
import { sequelize } from '@/infrastructure/config/seq';

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

  async findAll(): Promise<Listing[]> {
    const records = await this.model.findAll({
      include: [
        {
          model: PictureModel,
          as: "pictures",
        },
      ],
    });
    return records.map(record =>
      ListingMapper.toDomain(record)
    );
  }

  findAllWithPictures(): Promise<Listing[]> {
    return this.model.findAll({ include: PictureModel }).then(records => records.map(record => ListingMapper.toDomain(record)));
  }

  async create(listing: Listing): Promise<Listing> {
    // Use save() which handles listing + categories + amenities + pictures in a transaction
    await this.save(listing);
    // Reload with pictures included
    const created = await this.model.findByPk(listing.id, {
      include: [{ model: PictureModel, as: "pictures" }],
    });
    return ListingMapper.toDomain(created!);
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
    const listing = await this.model.findByPk(id, {
      include: [
        {
          model: PictureModel,
          as: "pictures"
        }
      ]
    });
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

  async findFeatured(limit: number = 6): Promise<Listing[]> {
    const records = await this.model.findAll({
      where: { isFeatured: true },
      limit,
      order: [["createdAt", "DESC"]],
    });

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
  const transaction = await sequelize.transaction();

  try {
    const listingData = ListingMapper.toPersistence(listing);

    await ListingModel.create(listingData, {
      transaction,
    });

    for (const picture of listing.pictures) {
       console.log("Saving picture:", picture);
      await PictureModel.create(
        PictureMapper.toPersistence(picture),
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
