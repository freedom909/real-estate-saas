//src/core/listing/infrastructure/models/listingCategory.model.ts


import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

export class ListingCategoryModel extends Model<
  InferAttributes<ListingCategoryModel>,
  InferCreationAttributes<ListingCategoryModel>
> {
  declare listingId: string;
  declare categoryId: string;

  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initListingCategoryModel(
  sequelize: Sequelize
) {
  ListingCategoryModel.init(
    {
      listingId: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },

      categoryId: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
      },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "listing_categories",
      timestamps: true,
    }
  );

  return ListingCategoryModel;
}