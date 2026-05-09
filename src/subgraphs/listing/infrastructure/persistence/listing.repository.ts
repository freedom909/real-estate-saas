//src/subgraphs/listing/infrastructure/persistence/listing.repository.ts
import { injectable, inject } from 'tsyringe';
import { Listing } from '../../domain/entities/Listing';
import { ListingMapper } from '../mappers/listing.mapper';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import { IListingRepository } from '../../domain/repos/IListingRepository';
import { Sequelize } from 'sequelize';
import ListingModel from '../models/listing.model';
import ListingCategories from '../models/listingCategories.model';
import ListingAmenity from '../models/listingAmenities.model';


@injectable()
export class ListingRepository implements IListingRepository {
  constructor(
    @inject(TOKENS_LISTING.ListingModel)
    private model: typeof ListingModel,
    @inject(TOKENS_LISTING.ListingCategoriesModel)
    private listingCategoryModel: typeof ListingCategories,
    @inject(TOKENS_LISTING.ListingAmenityModel)
    private listingAmenityModel: typeof ListingAmenity,
    @inject(TOKENS_LISTING.Sequelize)
    private sequelize: Sequelize,
  ) {}

  async create(listing: Listing): Promise<Listing> {
    return this.save(listing);
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
    const record = await this.model.findByPk(id);
    return record ? this.toDomainWithRelations(record) : null;
  }

  async findByHostId(hostId: string): Promise<Listing[]> {
    const records = await this.model.findAll({ where: { hostId } });
    return Promise.all(records.map(record => this.toDomainWithRelations(record)));
  }

  private async toDomainWithRelations(record: ListingModel): Promise<Listing> {
    const [categoryRows, amenityRows] = await Promise.all([
      this.listingCategoryModel.findAll({ where: { listingId: record.id } }),
      this.listingAmenityModel.findAll({ where: { listingId: record.id } }),
    ]);

    return ListingMapper.toDomain({
      ...record.get({ plain: true }),
      categories: categoryRows.map(row => row.getDataValue("categoryId")),
      amenityIds: amenityRows.map(row => row.getDataValue("amenityId")),
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
          amenityIds.map((amId: string) => ({
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
