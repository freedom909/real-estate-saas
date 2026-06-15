import { container } from "tsyringe";
import { CreateBookingUseCase } from "../application/usecases/create-booking.usecase";
import { CancelBookingUseCase } from "../application/usecases/cancel-booking.usecase";
import { GetBookingUseCase } from "../application/usecases/get-booking.usecase";
import { RabbitMQEventBus } from "./events/rabbitmq-event-bus";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";


export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve(GetBookingUseCase).execute(id);
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      return container
        .resolve(CreateBookingUseCase)
        .execute({ ...input, guestId: user.id });
    },

    cancelBooking: async (_: any, { id, reason }: any) => {
      return container
        .resolve(CancelBookingUseCase)
        .execute(id, reason || "No reason provided");
    },
  },
};