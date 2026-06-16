// FILE: src/subgraphs/booking/infrastructure/models/booking.model.ts
import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
} from "sequelize";
import { BookingStatus } from "../../domain/value-objects/booking-status"; // Corrected import path
import { BookingLifecycleStatus } from "../../domain/value-objects/booking-lifecycle.status";

export interface BookingAttributes {
  id: string;
  listingId: string;
  guestId: string;
  tenantId: string;
  checkInDate: Date;
  checkOutDate: Date;
  price: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  confirmedAt?: Date;
  cancelReason?: string;
  completedAt?: Date;
  bookingLifecycleStatus?: string;
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
  public tenantId!: string;
  public checkInDate!: Date;
  public checkOutDate!: Date;
  public price!: number;
  public status!: BookingStatus; // Changed from string to BookingStatus enum
  public cancelReason?: string;
  public confirmedAt?: Date;
  public completedAt?: Date;
  public bookingLifecycleStatus!: BookingLifecycleStatus;
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
      tenantId: DataTypes.STRING,
      checkInDate: DataTypes.DATE,
      checkOutDate: DataTypes.DATE,
      price: DataTypes.FLOAT,
      status: DataTypes.STRING,
      cancelReason: DataTypes.STRING,
      confirmedAt: DataTypes.DATE,
      bookingLifecycleStatus: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: "bookings",
      timestamps: true,
    }
  );

  return BookingModel;
};