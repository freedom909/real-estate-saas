import { container } from "tsyringe";
import { CreateBookingUseCase } from "../application/usecases/create-booking.usecase";
import { CancelBookingUseCase } from "../application/usecases/cancel-booking.usecase";
import { GetBookingUseCase } from "../application/usecases/get-booking.usecase";
import { RabbitMQEventBus } from "./events/rabbitmq-event-bus";
import TOKENS from "@/modules/tokens/ai/mq.tokens";

export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve(GetBookingUseCase).execute(id);
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      const eventBus = container.resolve<RabbitMQEventBus>(TOKENS.eventBus);
      await eventBus.init();
      return container
        .resolve(CreateBookingUseCase)//
        .execute({ ...input, guestId: user.id });
    },

    cancelBooking: async (_: any, { id }: any, { user }: any) => {
      return container
        .resolve(CancelBookingUseCase)
        .execute(id, user.id);
    },
  },
};