// container.ts

import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { SequelizeBookingRepository } from "@/core/booking/infrastructure/repos/sequelizeBookingRepository";
import { BookingRepository } from "@/core/booking/infrastructure/repos/bookingRepository";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { BookingGateway } from "@/core/booking/bookingGateway";

export const BookingRegister = () => {

  container.register<IBookingRepository>(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: BookingRepository,
  });

container.register(TOKENS_BOOKING.usecase.confirmBookingUseCase, {
  useClass: ConfirmBookingUseCase,
});
container.register(TOKENS_BOOKING.usecase.cancelBookingUseCase, {
  useClass: CancelBookingUseCase,
});

container.register(TOKENS_BOOKING.gateway.bookingGateway, {
  useClass: BookingGateway,
});

container.register(TOKENS_BOOKING.repository.bookingRepository, {
  useClass: BookingRepository,
});

container.register<IBookingRepository>(
  TOKENS_BOOKING.repository.bookingRepository,
  { useClass: SequelizeBookingRepository }
);
}