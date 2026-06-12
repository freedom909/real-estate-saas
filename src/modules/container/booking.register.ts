// container.ts




import { CancelBookingUseCase } from "@/subgraphs/booking/application/usecases/cancel-booking.usecase";
import { ConfirmBookingUseCase } from "@/subgraphs/booking/application/usecases/confirm-booking.usecase";
import { BookingGateway } from "@/subgraphs/booking/bookingGateway";

import { BookingRepository } from "@/subgraphs/booking/infrastructure/repos/bookingRepository";

import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";

export const BookingRegister = () => {

  container.register<IBookingRepository>("BookingRepository", {
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

}