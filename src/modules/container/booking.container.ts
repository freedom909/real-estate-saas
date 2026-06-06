import "reflect-metadata";
import { container } from "tsyringe";
import { IBookingRepository } from "../../subgraphs/booking/domain/repositories/i-booking.repository";
import { SequelizeBookingRepository } from "@/subgraphs/booking/infrastructure/repos/sequelizeBookingRepository";



container.register<IBookingRepository>(
  "BookingRepository",
  { useClass: SequelizeBookingRepository }
);

export { container };