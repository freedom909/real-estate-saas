import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
} from "sequelize";

export interface BookingAttributes {
  id: string;
  listingId: string;
  guestId: string;
  checkInDate: Date;
  checkOutDate: Date;
  totalCost: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type BookingCreationAttributes = Optional<
  BookingAttributes,
  "id" | "createdAt" | "updatedAt"
>;

export class BookingModel
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: string;
  public listingId!: string;
  public guestId!: string;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public totalCost!: number;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initBookingModel = (sequelize: Sequelize) => {
  BookingModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      listingId: DataTypes.STRING,
      guestId: DataTypes.STRING,
      checkInDate: DataTypes.DATE,
      checkOutDate: DataTypes.DATE,
      totalCost: DataTypes.FLOAT,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "bookings",
      timestamps: true,
    }
  );

  return BookingModel;
};