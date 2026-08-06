// src/core/listing/infrastructure/models/picture.model.ts

import { sequelize } from "@/infrastructure/config/seq";
import "reflect-metadata";
import { Model, InferAttributes, InferCreationAttributes, CreationOptional, DataTypes } from 'sequelize';

class PictureModel extends Model<InferAttributes<PictureModel>, InferCreationAttributes<PictureModel>> {
  id: string;
  listingId: string;
  objectKey: string;
  type: string;
  mimeType: string;
  size: number;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
  sortOrder: CreationOptional<number>;
}
PictureModel.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },


    listingId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },


    objectKey: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },


    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },


    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },


    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue:"image/jpeg",
    },


    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue:0
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
    tableName: "pictures",
    timestamps: true,
  }
);


export default PictureModel;
