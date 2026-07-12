console.log("BOOKING RESOLVER LOADED");
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { container } from "tsyringe";


export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      return container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(id);
    },
    bookingsForCustomer: async (_: any, { userId }: any) => {
      const repo =
        container.resolve<IBookingRepository>(
          TOKENS_BOOKING.repository.bookingRepository
        );

      return repo.findByCustomerId(userId);
    },
    myBookings: async (_: any, __: any, { context }: any) => {
      const userId = context.user.userId;
      return container.resolve<IBookingRepository>(
        TOKENS_BOOKING.repository.bookingRepository
      ).findByCustomerId(userId);
    },
  },
  Mutation: {
    createBooking: async (_: any, { input }: any, context: any) => {
      console.log("FULL CONTEXT:", context);

      console.log("CONTEXT USER:", context.user);

      const user = context.user;

      if (!user) {

        throw new Error("Unauthenticated: context.user is null");

      }
      const tenantId = user.sub;
      const userId = user.userId;

      // Fallback to input.tenantId if context user doesn't have it

      const price = input.price !== undefined ? Number(input.price) : 0; // Default price to 0 if not provided
      const booking = await container
        .resolve<CreateBookingUseCase>(TOKENS_BOOKING.usecase.createBookingUseCase)
        .execute({
          listingId: input.listingId, // Explicitly pass required fields
          customerId: userId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          tenantId: tenantId,
          price: price,
          // Other optional fields from input can be spread if needed, but ensure required are explicit
          // ...input // Be careful with spreading if it might overwrite explicit values
        });

      return {
        code: 200,
        success: true,
        message: "Your booking has been successfully created",
        booking,
      };
    },

    cancelBooking: async (_: any, { id, reason }: any) => {
      const usecase = container.resolve<CancelBookingUseCase>(TOKENS_BOOKING.usecase.cancelBookingUseCase);

      const booking = await usecase.execute(id, reason || "No reason provided");

      return {
        code: 200,
        success: true,
        message: "Booking cancelled",
        booking,
      };
    },

    confirmBooking: async (_: any, { id }: any, { user }: any) => {
      const userId = user?.id || user?.userId;
      if (!userId) {
        throw new Error("Unauthenticated: Please log in to confirm a booking.");
      }

      return container
        .resolve<ConfirmBookingUseCase>(TOKENS_BOOKING.usecase.confirmBookingUseCase)
        .execute(id);
    },

    completeBooking: async (_: any, { id }: any) => {
      return container.resolve<CompleteBookingUseCase>(TOKENS_BOOKING.usecase.completeBookingUseCase).execute(id);

    },
  },

  Booking: {
    listing: (parent: any) => ({ __typename: "Listing", id: parent.listingId || parent.listing_id }),

    customer: (parent) => ({
      __typename: "User",
      id: parent.customerId
    }),

    // ✅ Handle potential snake_case from DB or missing fields
    checkInDate: (parent: any) => parent.checkInDate || parent.dateRange?.checkInDate || parent.check_in_date,
    checkOutDate: (parent: any) => parent.checkOutDate || parent.dateRange?.checkOutDate || parent.check_out_date,
    price: (parent: any) => parent.price || parent.total_price || 0,
    __resolveReference: async (reference: { id: string }) => {
      return container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(reference.id);
    },
  },

  User: {
    bookings: async (user: { id: string }) => {

      const repo =
        container.resolve<IBookingRepository>(
          TOKENS_BOOKING.repository.bookingRepository
        );

      return repo.findByCustomerId(
        user.id
      );
    },
  },


  // Note: The 'Review' field on the 'Booking' type should be handled 
  // by the Review Subgraph using the @key directive, 
  // not by a resolver inside the Booking Subgraph.

};