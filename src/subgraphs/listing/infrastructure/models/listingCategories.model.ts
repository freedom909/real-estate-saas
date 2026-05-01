import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

import Category from './category.model';
import Listing from './listing.model';


class ListingCategoriesModel extends Model {}

ListingCategoriesModel.init(
  {
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Listing,
        key: 'id',
      },
      primaryKey: true,
    },
    categoryId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'ListingCategory',
    tableName: 'listing_categories',
    timestamps: true,
  }
);

export default ListingCategoriesModel;
