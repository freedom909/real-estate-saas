// container.ts

import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens";
import { SequelizeBookingRepository } from "@/core/booking/infrastructure/repos/sequelizeBookingRepository";

import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { BookingGateway } from "@/core/booking/bookingGateway";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { GetBookingsForCustomerUseCase } from "@/core/booking/application/usecases/getBookingsForCustomer.useCase";
import { UpdateBookingUseCase } from "@/core/booking/application/usecases/update-booking.usecase";
import { CheckInBookingUseCase } from "@/core/booking/application/usecases/check-in-booking.usecase";
import { ListingGateway } from "@/core/booking/infrastructure/gateways/listing.gateway";
import { TOKENS_PAYMENT } from "../tokens/payment.tokens";
import { PaymentRepository } from "@/core/payment/infra/repository/payment.repository";
import { CalendarClient } from "@/core/booking/application/adapter/calendar";

export const BookingRegister = () => {
  // Repositories
  container.register(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: SequelizeBookingRepository,
  });
  container.register(TOKENS_PAYMENT.repos.paymentRepository, {
    useClass: PaymentRepository,
  });
  // ACL
  // container.register(TOKENS_BOOKING.acl.bookingACL, {
  //   useClass: BookingACL,
  // });
  
  container.register(TOKENS_BOOKING.acl.calendarClient, {
    useClass: CalendarClient,
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
  container.register(TOKENS_BOOKING.usecase.updateBookingUseCase, {
    useClass: UpdateBookingUseCase,
  });
  container.register(TOKENS_BOOKING.usecase.checkInBookingUseCase, {
    useClass: CheckInBookingUseCase,
  });

  // Gateways
  container.register(TOKENS_BOOKING.gateway.bookingGateway, {
    useClass: BookingGateway,
  });
  container.register(TOKENS_BOOKING.gateway.listingGateway, {
    useClass: ListingGateway,
  });
}
