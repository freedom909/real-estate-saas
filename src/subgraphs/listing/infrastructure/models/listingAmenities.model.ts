// FILE: src/subgraphs/listing/infrastructure/models/ListingAmenity.model.ts

import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";



class ListingAmenityModel extends Model {}

ListingAmenityModel.init(
  {
    listingId: { type: DataTypes.STRING, primaryKey: true },
    amenityId: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    sequelize,
    tableName: 'listing_amenities',
    timestamps: false,
  }
);

export default ListingAmenityModel;
