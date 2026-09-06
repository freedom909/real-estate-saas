//src/core/listing/infrastructure/models/listing.model.ts

import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

import { sequelize } from "@/infrastructure/config/seq";
import { PictureModel } from "./picture.model";

export class ListingModel extends Model<
  InferAttributes<ListingModel>,
  InferCreationAttributes<ListingModel>
> {
  declare id: string;

  declare title: string;
  declare description: string;

  declare ownerId: string;
  declare locationId: string;

  declare amenityIds?: string[];

  declare numOfBeds: number;
  declare numOfCustomers: number;
  declare numOfBathrooms: number;
  declare numOfRooms: number;

  declare pricePerNight: number;

  declare isFeatured: boolean;

  declare pictures?: PictureModel[];


}

ListingModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    ownerId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    locationId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    amenityIds: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    numOfBeds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    numOfCustomers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    numOfBathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    numOfRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 1.0,
    },

    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true,
    paranoid: true,
  }
);

// Associations are defined in associations.ts and called at startup

export default ListingModel;