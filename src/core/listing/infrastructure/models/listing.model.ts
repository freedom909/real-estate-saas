// src/subgraphs/listing/infrastructure/models/listing.model.ts

import "reflect-metadata";
import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

class ListingModel extends Model {}

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

    numOfCustomers: {
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
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Sequelize will manage createdAt and updatedAt automatically when timestamps is true
  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true, // Enable timestamps to automatically manage createdAt and updatedAt
  }
)


export default ListingModel;
