// FILE: src/subgraphs/listing/infrastructure/models/ListingAmenity.model.ts

import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";



class ListingAmenities extends Model {
  declare listingId: string;
  declare amenityId: string;
}

ListingAmenities.init(
  {
    listingId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    amenityId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "listing_amenities",
    timestamps: false,
  }
);

export default ListingAmenities;
