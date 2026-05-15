import "reflect-metadata";
import { container } from "tsyringe";
import { Sequelize } from "sequelize";
import { initBookingModel } from "@/subgraphs/booking/infrastructure/models/booking.model.js";
import { SequelizeBookingRepository } from "@/subgraphs/booking/infrastructure/repositories/BookingRepository.js";
import { CreateBookingUseCase } from "@/subgraphs/booking/application/use-cases/create-booking.use-case.js";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case.js";
import { GetBookingUseCase } from "@/subgraphs/booking/application/use-cases/get-booking.use-case.js";


export async function initializeBookingContainer() {
  const sequelize = new Sequelize(process.env.MYSQL_URI!, {
    logging: false,
  });

  initBookingModel(sequelize);

  await sequelize.sync();

  // ✅ register infra
  container.register("Sequelize", { useValue: sequelize });

  container.register("BookingRepository", {
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