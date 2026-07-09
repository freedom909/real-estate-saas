// container.ts

import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { SequelizeBookingRepository } from "@/core/booking/infrastructure/repos/sequelizeBookingRepository";

import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { BookingGateway } from "@/core/booking/bookingGateway";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { GetBookingsForCustomerUseCase } from "@/core/booking/application/usecases/getBookingsForCustomer.useCase";



export const BookingRegister = () => {
  // Repositories
  container.register(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: SequelizeBookingRepository,
  });

  // State Machine
  // container.register(TOKENS_BOOKING.state.bookingStateMachine, {
  //   useClass: BookingStateMachine,
  // });
  // Use Cases
  container.register(TOKENS_BOOKING.usecase.confirmBookingUseCase, {
    useClass: ConfirmBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.cancelBookingUseCase, {
    useClass: CancelBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.createBookingUseCase, {
    useClass: CreateBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.getBookingUseCase, {
    useClass: GetBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.completeBookingUseCase, {
    useClass: CompleteBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.getBookingsForCustomerUseCase, {
    useClass: GetBookingsForCustomerUseCase,
  });

  // Gateways
  container.register(TOKENS_BOOKING.gateway.bookingGateway, {
    useClass: BookingGateway,
  });
}
