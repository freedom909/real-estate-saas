// category.model.ts

import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@/infrastructure/config/seq';


class CategoryModel extends Model { public id!: string; public name!: string; }
CategoryModel.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  tableName: 'categories',
  timestamps: false,
});

export default CategoryModel;