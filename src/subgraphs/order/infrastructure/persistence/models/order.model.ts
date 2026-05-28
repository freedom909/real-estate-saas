// FILE: src/subgraphs/order/infrastructure/persistence/models/order.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/seq';

class OrderModel extends Model {
  public id!: string;
  public orderNumber!: string;
  public guestId!: string;
  public listingId!: string;
  public checkInDate!: string;
  public checkOutDate!: string;
  public totalPrice!: number;
  public status!: string;
  public paymentStatus!: string;
  public paymentIntentId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

OrderModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    guestId: { type: DataTypes.STRING, allowNull: false },
    listingId: { type: DataTypes.STRING, allowNull: false },
    checkInDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkOutDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    paymentStatus: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    paymentIntentId: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
  }
);

export default OrderModel;