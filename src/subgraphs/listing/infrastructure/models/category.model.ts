// models/mysql/category.js
import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

class Category extends Model {}

Category.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },             // <--- First dropdown
    featured_title: { type: DataTypes.STRING, allowNull: true },   // <--- Temporarily allow null
    image: { type: DataTypes.STRING }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false
  }
);

export const validateCategoryInput = (input: { name?: string; type?: string }) => {
  if (!input.name) {
    throw new Error('Category name is required');
  }
  if (!input.type) {
    throw new Error('Category type is required');
  }
};
export default Category;
