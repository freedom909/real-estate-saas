import { container } from "tsyringe";
import { CreateBookingUseCase } from "../application/use-cases/create-booking.use-case";
import { CancelBookingUseCase } from "../application/use-cases/cancel-booking.use-case";
import { GetBookingUseCase } from "../application/use-cases/get-booking.use-case";

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

    cancelBooking: async (_: any, { id }: any, { user }: any) => {
      return container
        .resolve(CancelBookingUseCase)
        .execute(id, user.id);
    },
  },
};