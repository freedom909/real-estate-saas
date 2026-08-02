// src/subgraphs/listing/infrastructure/models/listing.model.ts

import "reflect-metadata";
import { Model, DataTypes, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";
import type PictureModel from "./picture.model";


class ListingModel extends Model<InferAttributes<ListingModel>,
  InferCreationAttributes<ListingModel>
>{
  declare id:string;

  declare title:string;

  declare description:string;

  declare ownerId:string;

  declare locationId:string;
  declare amenityIds?:string[];

  declare address:string;

  declare numOfBeds:number;

  declare numOfCustomers:number;

  declare numOfBathrooms:number;


  declare numOfRooms:number;

  declare price:number;

  declare isFeatured:boolean;


  // ⭐ 加这里
  declare pictures?: PictureModel[];

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

    amenityIds: {
      type: DataTypes.JSON(),
      allowNull: true,
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

    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

  },
  {
    sequelize,
    tableName: "listings",
    timestamps: true, // Enable timestamps to automatically manage createdAt and updatedAt
  }
)


export default ListingModel;
