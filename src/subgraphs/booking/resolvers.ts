import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { container } from "tsyringe";

export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(id);
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      console.log("user", user);
      console.log("input", input);

      const booking = await container
        .resolve<CreateBookingUseCase>(TOKENS_BOOKING.usecase.createBookingUseCase)
        .execute({ ...input, guestId: user.id });// "message": "Cannot read properties of null (reading 'id')",

      return {
        code: 200,
        success: true,
        message: "Your booking has been successfully created",
        booking,
      };
    },

    cancelBooking: async (_: any, { id }: any, { user }: any) => {
      const booking = await container
        .resolve<CancelBookingUseCase>(TOKENS_BOOKING.usecase.cancelBookingUseCase)
        .execute(id, user.id);

      return {
        code: 200,
        success: true,
        message: "Booking cancelled",
        booking,
      };
    },

    confirmBooking: async (_: any, { id }: any, { user }: any) => {
      return container
        .resolve<ConfirmBookingUseCase>(TOKENS_BOOKING.usecase.confirmBookingUseCase)
        .execute(id);
    },
  },

  Booking: {
    listing: (parent: any) => ({ __typename: "Listing", id: parent.listingId }),
    guest: (parent: any) => ({ __typename: "Guest", id: parent.guestId }),
    __resolveReference: async (reference: { id: string }) => {
      return container.resolve(GetBookingUseCase).execute(reference.id);
    },
  },

  // Note: The 'Review' field on the 'Booking' type should be handled 
  // by the Review Subgraph using the @key directive, 
  // not by a resolver inside the Booking Subgraph.
};