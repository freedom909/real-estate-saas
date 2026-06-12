//src/subgraphs/listing/infrastructure/persistence/listing.repository.ts
import { injectable, inject } from 'tsyringe';

import { ListingMapper } from '../mappers/listing.mapper';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/entities/IListingRepository';
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

  async create(listing: Listing): Promise<Listing> {
 const persistence =
    ListingMapper.toPersistence(listing);

  const created =
    await this.model.create(persistence);

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

async findById(
  id: string
): Promise<Listing | null> {

  console.log(
    "REPO STEP 1"
  );

  const listing =
    await this.model.findByPk(id);

  console.log(
    "REPO STEP 2 listing",
    listing?.toJSON()
  );

  if (!listing) {
    return null;
  }

  console.log(
    "REPO STEP 3 categories"
  );

  const categoryRows =
    await this.listingCategoryModel.findAll({
      where: {
        listingId: id
      }
    });

  console.log(
    "REPO STEP 4 categoryRows",
    categoryRows
  );

  const categories =
    categoryRows.map(
      (c: any) =>
        c.categoryId
    );

  console.log(
    "REPO STEP 5 amenities"
  );

  const amenityRows =
    await this.listingAmenityModel.findAll({
      where: {
        listingId: id
      }
    });

  console.log(
    "REPO STEP 6 amenityRows",
    amenityRows
  );

  const amenityIds =
    amenityRows.map(
      (a: any) =>
        a.amenityId
    );

  console.log(
    "REPO STEP 7 mapper"
  );

  const domain =
    ListingMapper.toDomain({
      ...listing.toJSON(),
      categories,
      amenityIds,
    });

  console.log(
    "REPO STEP 8 success"
  );

  return domain;
}

  async findByHostId(hostId: string): Promise<Listing[]> {
    // Assuming hostId maps to hostId in the MySQL schema
    const records = await this.model.findAll({ where: { hostId: hostId } });
    return records.map(record => ListingMapper.toDomain(record));
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
      // Extract IDs from the domain entity
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
}}