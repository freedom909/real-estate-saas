// src/core/admin/infrastructure/models/systemSettings.model.ts

import "reflect-metadata";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";

class SystemSettingsModel extends Model {}

SystemSettingsModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "general",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "system_settings",
    timestamps: true,
  }
);

export default SystemSettingsModel;
