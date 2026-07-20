import { Model, DataTypes, Optional } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";

export interface CartItemAttributes {
  id: string;
  cartId: string;
  listingId: string;
  quantity: number;
  price: number;
  checkInDate?: Date;
  checkOutDate?: Date;
}

type CartItemCreationAttributes = Optional<CartItemAttributes, "id" | "quantity" | "checkInDate" | "checkOutDate">;

export class CartItemModel extends Model<CartItemAttributes, CartItemCreationAttributes> implements CartItemAttributes {
  public id!: string;
  public cartId!: string;
  public listingId!: string;
  public quantity!: number;
  public price!: number;
  public checkInDate?: Date;
  public checkOutDate?: Date;
}

CartItemModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "cart_items",
    timestamps: true,
  }
);
