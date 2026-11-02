// src/migrations/20261102062352-create-calendar-slots.ts

"use strict";

import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    await queryInterface.createTable("calendar_slots", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },

      listingId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      date: {
        type: DataTypes.DATEONLY,
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

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex(
      "calendar_slots",
      ["listingId", "date"],
      {
        unique: true,
        name: "uq_calendar_listing_date",
      }
    );
  }

 export async function down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("calendar_slots");
  
};