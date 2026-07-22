// src/core/admin/infrastructure/models/auditLog.model.ts

import "reflect-metadata";
import { Model, DataTypes } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";

class AuditLogModel extends Model {}

AuditLogModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    adminId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    targetId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "audit_logs",
    timestamps: false,
  }
);

export default AuditLogModel;
