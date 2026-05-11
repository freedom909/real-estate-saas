import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";


class ListingCategories extends Model {}

ListingCategories.init(
  {
    listingId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "listing_categories",
    timestamps: true,
  }
);

export default ListingCategories;
