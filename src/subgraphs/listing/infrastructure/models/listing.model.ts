// src/subgraphs/listing/infrastructure/models/listing.model.ts

import "reflect-metadata";
import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

class ListingModel extends Model {}

ListingModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    pictures: { type: DataTypes.JSON }, // array of URLs
    numOfBeds: { type: DataTypes.INTEGER },
    price: { type: DataTypes.FLOAT },
    isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
    saleAmount: { type: DataTypes.FLOAT },
    checkInDate: { type: DataTypes.DATEONLY },
    checkOutDate: { type: DataTypes.DATEONLY },
    hostId: { type: DataTypes.STRING, allowNull: false }, 
    locationId: { type: DataTypes.STRING },
    amenityIds: {
  type: DataTypes.VIRTUAL,
  get() {
    return this.getDataValue('amenityIds') ?? [];
  }
},
    listingStatus: { 
      type: DataTypes.ENUM(
        'ACTIVE',
        'PENDING',
        'SOLD',
        'DELETED',
        'REJECT',
        'CANCELLED',
        'EXPIRED',
        'COMPLETED'
      ), 
      allowNull: false 
    },
    locationType: { 
      type: DataTypes.ENUM('ROOM', 'APARTMENT', 'HOUSE', 'COTTAGE', 'VILLA', 'SPACESHIP', 'CAMPSITE', 'OTHER'), 
      allowNull: false 
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }

 );

export default ListingModel;
