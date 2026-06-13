// models/mysql/order.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/seq.js';

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    orderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    guestId: { type: DataTypes.STRING, allowNull: false },
    listingId: { type: DataTypes.STRING, allowNull: false },
    checkInDate: { type: DataTypes.DATEONLY, allowNull: false },
    checkOutDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    status: { 
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED'), 
      defaultValue: 'PENDING',
      allowNull: false 
    },
    paymentStatus: { 
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'CANCELLED'), 
      defaultValue: 'PENDING',
      allowNull: false 
    },
    paymentIntentId: { type: DataTypes.STRING },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  }
);

export default Order;