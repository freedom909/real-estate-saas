// models/mysql/amenity.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/seq.js';

class Amenity extends Model { }

Amenity.init(
  {
    id: {
      type: DataTypes.INTEGER, // or INTEGER, just stay consistent
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER, // or INTEGER
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    locationId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'locations',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    sequelize,
    modelName: 'Amenity',
    tableName: 'amenities',
    timestamps: false,
  }

);

export default Amenity;
