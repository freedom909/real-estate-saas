import "reflect-metadata";
import { container } from "tsyringe";
import { Sequelize } from "sequelize";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { initBookingModel } from "@/core/booking/infrastructure/models/booking.model";
import { BookingRegister } from "@/modules/container/booking.register";

export async function initializeBookingContainer() {
  const sequelize = new Sequelize(process.env.MYSQL_URI!, {
    logging: false,
  });

  initBookingModel(sequelize);
  await sequelize.sync({ alter: true });
  // ✅ register infra
  container.register("Sequelize", { useValue: sequelize });
  BookingRegister(); // Call the registration function to register all booking dependencies
  return container; // ✅ 必须 return
}