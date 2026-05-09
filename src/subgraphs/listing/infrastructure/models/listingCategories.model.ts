import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

import Category from './category.model';
import Listing from './listing.model';


class ListingCategories extends Model {
  declare listingId: string;
  declare categoryId: string;
}

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
