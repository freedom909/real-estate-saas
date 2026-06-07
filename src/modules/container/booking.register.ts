// container.ts




import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case";
import { ConfirmBookingUseCase } from "@/subgraphs/booking/application/use-cases/confirm-booking.use-case";
import { BookingGateway } from "@/subgraphs/booking/BookingGateway";
import { IBookingRepository } from "@/subgraphs/booking/domain/repositories/i-booking.repository";
import { BookingRepository } from "@/subgraphs/booking/infrastructure/repos/bookingRepository";

import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";

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