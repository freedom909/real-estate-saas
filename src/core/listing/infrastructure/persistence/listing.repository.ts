//src/subgraphs/listing/infrastructure/persistence/listing.repository.ts

import { injectable, inject } from "tsyringe";
import { Op, Sequelize } from "sequelize";

import { ListingMapper } from "../mappers/listing.mapper";
import {
  IListingRepository,
  SearchListingsQuery,
} from "../../domain/entities/IListingRepository";

import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

import ListingModel from "../models/listing.model";
import ListingCategories from "../models/listingCategories.model";
import ListingAmenity from "../models/listingAmenities.model";

import Category from "../models/category.model";
import CategoryModel from "@/shared/category/infrastructure/category.model";

import { Listing } from "../../domain/entities/listing";

import { PictureModel } from "../models/picture.model";
import PictureMapper from "../mappers/picture.mapper";

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

  // =========================
  // Find All
  // =========================

  async findAll(): Promise<Listing[]> {
    const records = await this.model.findAll({
      include: [
        {
          model: PictureModel,
          as: "pictures",
        },
      ],
    });

    return records.map((record) =>
      ListingMapper.toDomain(record),
    );
  }

  // =========================
  // Find All With Pictures
  // =========================

  async findAllWithPictures(): Promise<Listing[]> {
    const records = await this.model.findAll({
      include: [
        {
          model: PictureModel,
          as: "pictures",
        },
      ],
    });

    return records.map((record) =>
      ListingMapper.toDomain(record),
    );
  }

  // =========================
  // Create
  // =========================

async create(listing: Listing): Promise<Listing> {
  const transaction = await this.sequelize.transaction();

  try {
    // 1. Create listing
    const listingData =
      ListingMapper.toPersistence(listing);

    await this.model.create(
      listingData as any,
      { transaction },
    );

    // 2. Save categories
    if (listing.categoryIds.length > 0) {
      await this.listingCategoryModel.bulkCreate(
        listing.categoryIds.map((categoryId) => ({
          listingId: listing.id,
          categoryId,
        })),
        { transaction },
      );
    }

    // 3. Save amenities
    if (listing.amenityIds.length > 0) {
      await this.listingAmenityModel.bulkCreate(
        listing.amenityIds.map((amenityId) => ({
          listingId: listing.id,
          amenityId,
        })),
        { transaction },
      );
    }

    // 4. Save pictures
    for (const picture of listing.pictures) {
      await PictureModel.create(
        PictureMapper.toPersistence(picture),
        { transaction },
      );
    }

    // 5. Commit
    await transaction.commit();

    // 6. Reload listing
    const created =
      await this.model.findByPk(
        listing.id,
        {
          include: [
            {
              model: PictureModel,
              as: "pictures",
            },
          ],
        },
      );

    if (!created) {
      throw new Error(
        `Listing ${listing.id} was created but could not be reloaded`,
      );
    }

    // 7. Reload category / amenity relations
    const categoryRows =
      await this.listingCategoryModel.findAll({
        where: { listingId: listing.id },
      });

    const categoryIds =
      categoryRows.map(
        (row: any) => row.categoryId,
      );

    const amenityRows =
      await this.listingAmenityModel.findAll({
        where: { listingId: listing.id },
      });

    const amenityIds =
      amenityRows.map(
        (row: any) => row.amenityId,
      );

    return ListingMapper.toDomain({
      ...created.toJSON(),
      categoryIds,
      amenityIds,
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

  // =========================
  // Update
  // =========================

   async update(
  id: string,
  listing: Listing,
): Promise<boolean> {
  const transaction = await this.sequelize.transaction();

  try {
    // 1. 更新 listings 主表
    const raw = ListingMapper.toPersistence(listing);

    const [affectedCount] = await this.model.update(
      raw as any,
      {
        where: { id },
        transaction,
      },
    );

    if (affectedCount === 0) {
      await transaction.rollback();
      return false;
    }

    // 2. 更新 listing_categories
    await this.listingCategoryModel.destroy({
      where: { listingId: id },
      transaction,
    });

    if (listing.categoryIds.length > 0) {
      await this.listingCategoryModel.bulkCreate(
        listing.categoryIds.map((categoryId) => ({
          listingId: id,
          categoryId,
        })),
        { transaction },
      );
    }

    // 3. 更新 listing_amenities
    await this.listingAmenityModel.destroy({
      where: { listingId: id },
      transaction,
    });

    if (listing.amenityIds.length > 0) {
      await this.listingAmenityModel.bulkCreate(
        listing.amenityIds.map((amenityId) => ({
          listingId: id,
          amenityId,
        })),
        { transaction },
      );
    }

    // 4. 提交事务
    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

  // =========================
  // Delete
  // =========================

  async delete(id: string): Promise<boolean> {
    const deletedCount =
      await this.model.destroy({
        where: { id },
      });

    return deletedCount > 0;
  }

  // =========================
  // Find By ID
  // =========================

  async findById(
    id: string,
  ): Promise<Listing | null> {
    const listing = await this.model.findByPk(
      id,
      {
        include: [
          {
            model: PictureModel,
            as: "pictures",
          },
        ],
      },
    );

    if (!listing) {
      return null;
    }

    const categoryRows =
      await this.listingCategoryModel.findAll({
        where: { listingId: id },
      });

    const categoryIds = categoryRows.map(
      (row: any) => row.categoryId,
    );

    const amenityRows =
      await this.listingAmenityModel.findAll({
        where: { listingId: id },
      });

    const amenityIds = amenityRows.map(
      (row: any) => row.amenityId,
    );

    return ListingMapper.toDomain({
      ...listing.toJSON(),
      categoryIds,
      amenityIds,
    });
  }

  // =========================
  // Find By Owner
  // =========================

  async findByOwnerId(
    ownerId: string,
  ): Promise<Listing[]> {
    const records =
      await this.model.findAll({
        where: { ownerId },
        include: [
          {
            model: PictureModel,
            as: "pictures",
          },
        ],
      });

    return records.map((record) =>
      ListingMapper.toDomain(record),
    );
  }

  // =========================
  // Find Featured
  // =========================

  async findFeatured(
    limit: number = 6,
  ): Promise<Listing[]> {
    const records =
      await this.model.findAll({
        where: {
          isFeatured: true,
        },
        include: [
          {
            model: PictureModel,
            as: "pictures",
          },
        ],
        limit,
        order: [["createdAt", "DESC"]],
      });

    const listingIds =
      records.map((record) => record.id);

    const categoryRows =
      listingIds.length > 0
        ? await this.listingCategoryModel.findAll({
            where: {
              listingId: listingIds,
            },
          })
        : [];

    const categoryMap =
      new Map<string, string[]>();

    for (const row of categoryRows as any[]) {
      const list =
        categoryMap.get(row.listingId) ?? [];

      list.push(row.categoryId);

      categoryMap.set(
        row.listingId,
        list,
      );
    }

    return records.map((record) => {
      const json = record.toJSON();

      return ListingMapper.toDomain({
        ...json,

        categoryIds:
          categoryMap.get(json.id) ?? [],

        amenityIds:
          json.amenityIds ?? [],

        pictures:
          (json.pictures ?? []).map(
            (picture: any) =>
              PictureMapper.toDomain(picture),
          ),
      });
    });
  }

  // =========================
  // Search
  // =========================

  async search(
    query: SearchListingsQuery,
  ): Promise<Listing[]> {
    const where: any = {};

    // Location
    if (query.locationId) {
      where.locationId = query.locationId;
    }

    // Customer count
    if (query.customerCount) {
      where.numOfCustomers = {
        [Op.gte]: query.customerCount,
      };
    }

    // Price range
    if (
      query.minPrice !== undefined ||
      query.maxPrice !== undefined
    ) {
      where.pricePerNight = {};

      if (query.minPrice !== undefined) {
        where.pricePerNight[Op.gte] =
          query.minPrice;
      }

      if (query.maxPrice !== undefined) {
        where.pricePerNight[Op.lte] =
          query.maxPrice;
      }
    }

    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    const records =
      await this.model.findAll({
        where,
        include: [
          {
            model: PictureModel,
            as: "pictures",
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

    const listingIds =
      records.map((record) => record.id);

    const categoryRows =
      listingIds.length > 0
        ? await this.listingCategoryModel.findAll({
            where: {
              listingId: listingIds,
            },
          })
        : [];

    const categoryMap =
      new Map<string, string[]>();

    for (const row of categoryRows as any[]) {
      const list =
        categoryMap.get(row.listingId) ?? [];

      list.push(row.categoryId);

      categoryMap.set(
        row.listingId,
        list,
      );
    }

    return records.map((record) => {
      const json = record.toJSON();

      return ListingMapper.toDomain({
        ...json,

        categoryIds:
          categoryMap.get(json.id) ?? [],

        amenityIds:
          json.amenityIds ?? [],

        pictures:
          (json.pictures ?? []).map(
            (picture: any) =>
              PictureMapper.toDomain(picture),
          ),
      });
    });
  }

  // =========================
  // Find Categories By IDs
  // =========================

  async findByIds(
    ids: string[],
  ): Promise<Category[]> {
    return CategoryModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
  }
}