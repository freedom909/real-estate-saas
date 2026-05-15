// container.ts



import { container } from "tsyringe";
import { TOKENS_BOOKING } from "../tokens/booking.tokens.js";
import { IBookingRepository } from "@/subgraphs/booking/domain/repositories/i-booking.repository.js";
import { SequelizeBookingRepository } from "@/subgraphs/booking/infrastructure/repositories/BookingRepository.js";
import { EventBus } from "@/shared/events/eventBus.js";
import { ConfirmBookingUseCase } from "@/subgraphs/booking/application/use-cases/confirm-booking.use-case.js";
import { BookingGateway } from "@/subgraphs/ai/domain/entities/contexts/BookingGateway.js";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case.js";


export const BookingRegister = () => {

  container.register<IBookingRepository>(TOKENS_BOOKING.repository.bookingRepository, {
    useClass: SequelizeBookingRepository, 
  });

container.register("EventBus", { useClass: EventBus });
container.register("confirmBookingUseCase", {
  useClass: ConfirmBookingUseCase,
});
container.register("cancelBookingUseCase", {
  useClass: CancelBookingUseCase,
});

container.register("BookingGateway", {
  useClass: BookingGateway,
});

container.register("EventBus", {
  useClass: EventBus,
});

}