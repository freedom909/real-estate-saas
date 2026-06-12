import "reflect-metadata";
import { container } from "tsyringe";
import { Sequelize } from "sequelize";

import {  initBookingModel } from "@/subgraphs/booking/infrastructure/models/booking.model";
import { SequelizeBookingRepository } from "@/subgraphs/booking/infrastructure/repos/sequelizeBookingRepository";
import { CreateBookingUseCase } from "@/subgraphs/booking/application/usecases/create-booking.usecase";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/usecases/cancel-booking.usecase";
import { GetBookingUseCase } from "@/subgraphs/booking/application/usecases/get-booking.usecase";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";

export async function initializeBookingContainer() {
  const sequelize = new Sequelize(process.env.MYSQL_URI!, {
    logging: false,
  });

  initBookingModel(sequelize);

  await sequelize.sync();

  // ✅ register infra
  container.register("Sequelize", { useValue: sequelize });

  container.register(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: SequelizeBookingRepository,
  });

  // ✅ register use cases
  container.register(CreateBookingUseCase, {
    useClass: CreateBookingUseCase,
  });

  container.register(CancelBookingUseCase, {
    useClass: CancelBookingUseCase,
  });

  container.register(GetBookingUseCase, {
    useClass: GetBookingUseCase,
  });

  return container; // ✅ 必须 return
}