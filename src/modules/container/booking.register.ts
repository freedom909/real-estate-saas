// container.ts


import { EventBus } from "@/shared/events/eventBus";
import { BookingGateway } from "@/subgraphs/ai/domain/entities/contexts/BookingGateway";
import { CancelBookingUseCase } from "@/subgraphs/booking/application/use-cases/cancel-booking.use-case";
import { ConfirmBookingUseCase } from "@/subgraphs/booking/application/use-cases/confirm-booking.use-case";
import { IBookingRepository } from "@/subgraphs/booking/domain/repositories/i-booking.repository";
import { BookingRepository } from "@/subgraphs/booking/infrastructure/repositories/bookingRepository";
import { container } from "tsyringe";

export const BookingRegister = () => {

  container.register<IBookingRepository>("BookingRepository", {
    useClass: BookingRepository,
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