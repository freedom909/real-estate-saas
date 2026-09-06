//src/core/location/infrastructure/persistence/location.model.ts

import { Model, DataTypes } from "sequelize";
import { sequelize } from "../config/seq";

class LocationModel extends Model {}

LocationModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },



    postalCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    prefecture: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    town: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    radius: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    units: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Location",
    tableName: "locations",
    timestamps: false,
  }
);

export default LocationModel;

