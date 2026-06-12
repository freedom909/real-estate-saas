// models/mysql/category.js
import { Model, DataTypes } from 'sequelize';
import { sequelize } from "@/infrastructure/config/seq";

export default class CategoryModel extends Model {}

CategoryModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false, // ❗关键
  }
);





