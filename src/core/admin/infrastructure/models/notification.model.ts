// src/core/admin/infrastructure/models/notification.model.ts

import "reflect-metadata";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";

class NotificationModel extends Model {}

NotificationModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("INFO", "WARNING", "ERROR", "SUCCESS"),
      allowNull: false,
      defaultValue: "INFO",
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "admin_notifications",
    timestamps: false,
  }
);

export default NotificationModel;
