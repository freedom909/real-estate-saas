// src/core/calendar/infrastructure/models/calendar-slot.model.ts

import {
  Model,
  DataTypes,
  Sequelize,
  Optional,
} from "sequelize";

export interface CalendarSlotAttributes {
  id: string;
  listingId: string;
  date: Date;
  status: string;
  bookingId?: string;
  blockedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type CalendarSlotCreationAttributes = Optional<
  CalendarSlotAttributes,
  "id" | "createdAt" | "updatedAt" | "bookingId" | "blockedBy"
>;

export class CalendarSlotModel
  extends Model<CalendarSlotAttributes, CalendarSlotCreationAttributes>
  implements CalendarSlotAttributes
{
  public id!: string;
  public listingId!: string;
  public date!: Date;
  public status!: string;
  public bookingId?: string;
  public blockedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initCalendarSlotModel = (sequelize: Sequelize) => {
  CalendarSlotModel.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      listingId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,  // store as DATE only (no time)
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "AVAILABLE",
      },
      bookingId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      blockedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "calendar_slots",
      timestamps: true,
      indexes: [
        // ⚡ CRITICAL: Unique constraint prevents double-booking at DB level
        // Only one RESERVED/OCCUPIED row can exist per listing per date
        {
          unique: true,
          fields: ["listingId", "date"],
          name: "uq_calendar_listing_date",
        },
      ],
    }
  );

  return CalendarSlotModel;
};
