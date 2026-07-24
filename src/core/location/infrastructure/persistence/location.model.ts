import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/seq';

class LocationModel extends Model {}

LocationModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    zip: { type: DataTypes.STRING, allowNull: false },
    country: { type: DataTypes.STRING, allowNull: false },
    latitude: { type: DataTypes.FLOAT, allowNull: false },
    longitude: { type: DataTypes.FLOAT, allowNull: false },
    radius: { type: DataTypes.FLOAT },
    units: { type: DataTypes.STRING, defaultValue: 'km' },
  },
  {
    sequelize,
    modelName: 'Location',
    tableName: 'locations',
    timestamps: false,
  }
);

export default LocationModel;
