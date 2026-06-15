import "reflect-metadata";
import { container } from "tsyringe";
import { Sequelize } from "sequelize";

import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { initBookingModel } from "@/core/booking/infrastructure/models/booking.model";
import { SequelizeBookingRepository } from "@/core/booking/infrastructure/repos/sequelizeBookingRepository";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";

export async function initializeBookingContainer() {
  const sequelize = new Sequelize(process.env.MYSQL_URI!, {
    logging: false,
  });

  initBookingModel(sequelize);

  await sequelize.sync({ alter: true });

  // ✅ register infra
  container.register("Sequelize", { useValue: sequelize });

  container.register(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: SequelizeBookingRepository,
  });

  // ✅ register use cases
  container.register(TOKENS_BOOKING.usecase.createBookingUseCase, {
    useClass: CreateBookingUseCase,
  });

  container.register(TOKENS_BOOKING.usecase.cancelBookingUseCase, {
    useClass: CancelBookingUseCase,
  });

  container.register(TOKENS_BOOKING.usecase.getBookingUseCase, {
    useClass: GetBookingUseCase,
  });

  return container; // ✅ 必须 return
}