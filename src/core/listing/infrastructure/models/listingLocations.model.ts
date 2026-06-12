// models/mysql/listingLocations.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

class ListingLocations extends Model {}

ListingLocations.init(
  {
    listingId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    locationId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
  },
  {
    sequelize,
    modelName: 'ListingLocations',
    tableName: 'listing_locations',
    timestamps: true, // keep timestamps for auditing
  }
);

export default ListingLocations;
