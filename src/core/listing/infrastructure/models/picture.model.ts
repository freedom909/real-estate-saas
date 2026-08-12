import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";

export class PictureModel extends Model<
  InferAttributes<PictureModel>,
  InferCreationAttributes<PictureModel>
> {

  declare id: string;

  declare listingId: string;

  declare objectKey: string;
  

  declare mimeType: string;
  declare size: number;

  declare type: string;
  declare sortOrder: number;
}

export function initPictureModel(sequelize: Sequelize) {
  PictureModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },

      listingId: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      objectKey: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "pictures",
      timestamps: true,
    }
  );

  return PictureModel;
}