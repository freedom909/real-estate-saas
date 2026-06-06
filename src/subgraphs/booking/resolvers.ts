import { container } from "tsyringe";
import { GetBookingUseCase } from "./application/use-cases/get-booking.use-case";
import { CreateBookingUseCase } from "./application/use-cases/create-booking.use-case";
import { CancelBookingUseCase } from "./application/use-cases/cancel-booking.use-case";
import { ConfirmBookingUseCase } from "./application/use-cases/confirm-booking.use-case";



export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve(GetBookingUseCase).execute(id);
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      console.log("user", user);
      console.log("input", input);

      const booking = await container
        .resolve(CreateBookingUseCase)
        .execute({ ...input, guestId: user.id });

      return {
        code: 200,
        success: true,
        message: "Your booking has been successfully created",
        booking,
      };
    },

    cancelBooking: async (_: any, { id }: any, { user }: any) => {
      const booking = await container
        .resolve(CancelBookingUseCase)
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
        .resolve(ConfirmBookingUseCase)
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