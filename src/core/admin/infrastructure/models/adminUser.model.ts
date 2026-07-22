// src/core/admin/infrastructure/models/adminUser.model.ts

import "reflect-metadata";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";

class AdminUserModel extends Model {}

AdminUserModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("ADMIN", "SUPER_ADMIN", "MODERATOR"),
      allowNull: false,
      defaultValue: "ADMIN",
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "admin_users",
    timestamps: true,
  }
);

export default AdminUserModel;
