import { container } from "tsyringe";
import { CreateBookingUseCase } from "../application/usecases/create-booking.usecase";
import { CancelBookingUseCase } from "../application/usecases/cancel-booking.usecase";
import { GetBookingUseCase } from "../application/usecases/get-booking.usecase";


export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve(GetBookingUseCase).execute(id);
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new Error("Authentication required");
      return container
        .resolve(CreateBookingUseCase)
        .execute(input, { customerId: user.userId, tenantId: user.tenantId || user.userId });
    },

    cancelBooking: async (_: any, { id, reason }: any) => {
      return container
        .resolve(CancelBookingUseCase)
        .execute(id, reason || "No reason provided");
    },
  },
};
