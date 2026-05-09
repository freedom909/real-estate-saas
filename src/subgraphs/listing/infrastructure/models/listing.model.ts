// src/subgraphs/listing/infrastructure/models/listing.model.ts

import "reflect-metadata";
import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

class ListingModel extends Model {
  declare id: string;
  declare title: string;
  declare description: string;
  declare hostId: string;
  declare locationId: string;
  declare address: string;
  declare numOfBeds: number;
  declare numOfGuests: number;
  declare numOfBathrooms: number;
  declare numOfRooms: number;
  declare price: number;
  declare picture?: string[];
  declare isFeatured: boolean;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ListingModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    hostId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    locationId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    numOfBeds: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    numOfGuests: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    numOfBathrooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    numOfRooms: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 1.0,
    },

    picture: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    createdAt: {
      type: DataTypes.DATE,
    },

    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: false,
  }
)


export default ListingModel;
