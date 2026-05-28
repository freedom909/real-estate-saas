// FILE: src/subgraphs/amenity/infrastructure/models/amenity.model.ts

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/infrastructure/config/seq';
import { AmenityCategory } from '../../domain/value-objects/AmenityCategory';

class AmenityModel extends Model { public id!: string; public name!: string; public category!: string; }

AmenityModel.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  category: { // ✅ 改这里
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  sequelize,
  tableName: 'amenities',
  timestamps: false,
});

export default AmenityModel;