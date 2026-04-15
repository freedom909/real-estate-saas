import { Listing } from "../../domain/entities/Listing";
import { Category } from "../../domain/entities/Category";

// 你应该有一个 DB Model 类型（推荐）
type ListingModel = any; // 👉 TODO: replace with Sequelize/TypeORM type

export class ListingMapper {
  // ========================
  // DB → Domain
  // ========================
  static toDomain(raw: ListingModel): Listing {
    return new Listing(
      id: raw.id,
      title: raw.title,
      description: raw.description,

      // ✅ 复杂关系 → Domain Entity
      categories: (raw.Categories || []).map(
        (c: any) =>
          new Category({
            id: c.id,
            name: c.name,
            type: c.type,
          })
      ),

      // ✅ 只需要 ID（轻量设计）
      amenityIds: (raw.Amenities || []).map((a: any) => a.id),

      tenantId: raw.tenantId,
    );
  }

  // ========================
  // Domain → DB
  // ========================
  static toPersistence(listing: Listing) {
    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      tenantId: listing.tenantId,

      // ❗ 注意：
      // categories / amenities NOT handled here
      // handled in repository (join tables)
    };
  }
}