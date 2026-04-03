import "reflect-metadata";
import { container } from "tsyringe";
import { IBookingRepository } from "./domain/repositories/i-booking.repository";
import { MongooseBookingRepository } from "./infrastructure/repositories/mongoose-booking.repository";

container.register<IBookingRepository>(
  "BookingRepository",
  { useClass: MongooseBookingRepository }
);

export { container };