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
    bookingsForGuest: async (_: any, { userId }: any) => {
      // Return bookings filtered by guestId
      // Replace with actual UseCase if available
      return []; 
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: any, { user }: any) => {
      const userId = user?.id || user?.userId;
      if (!userId) {
        throw new Error("Unauthenticated: Please log in to create a booking.");
      }

      // Fallback to input.tenantId if context user doesn't have it
      const tenantId = user?.tenantId || input.tenantId || "tenant-dev"; 
      const price = input.price !== undefined ? Number(input.price) : 0; // Default price to 0 if not provided
      const booking = await container
        .resolve<CreateBookingUseCase>(TOKENS_BOOKING.usecase.createBookingUseCase)
        .execute({
          listingId: input.listingId, // Explicitly pass required fields
          guestId: userId,
          checkInDate: input.checkInDate,
          checkOutDate: input.checkOutDate,
          tenantId: tenantId,
          price: price,
          // Other optional fields from input can be spread if needed, but ensure required are explicit
          // ...input // Be careful with spreading if it might overwrite explicit values
        });

      console.log("Resolver passing to CreateBookingUseCase:", JSON.stringify({ listingId: input.listingId, guestId: userId, checkInDate: input.checkInDate, checkOutDate: input.checkOutDate, tenantId, price }, null, 2));

      return {
        code: 200,
        success: true,
        message: "Your booking has been successfully created",
        booking,
      };
    },

    cancelBooking: async (_: any, { id }: any, { user }: any) => {
      const userId = user?.id || user?.userId;
      if (!userId) {
        throw new Error("Unauthenticated: Please log in to cancel a booking.");
      }

      const booking = await container
        .resolve<CancelBookingUseCase>(TOKENS_BOOKING.usecase.cancelBookingUseCase)
        .execute(id, userId);

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
  },

  Booking: {
    listing: (parent: any) => ({ __typename: "Listing", id: parent.listingId || parent.listing_id }),
    guest: (parent: any) => ({ __typename: "Guest", id: parent.guestId || parent.guest_id }),
    // ✅ Handle potential snake_case from DB or missing fields
    checkInDate: (parent: any) => parent.checkInDate || parent.dateRange?.checkInDate || parent.check_in_date,
    checkOutDate: (parent: any) => parent.checkOutDate || parent.dateRange?.checkOutDate || parent.check_out_date,
    reservedDate: (parent: any) => parent.reservedDate || parent.reserved_date || parent.createdAt,
    bookingNumber: (parent: any) => parent.bookingNumber || parent.booking_number || parent.id,
    price: (parent: any) => parent.price || parent.total_price || 0,
    __resolveReference: async (reference: { id: string }) => {
      return container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(reference.id);
    },
  },

  Guest: {
    bookings: async (guest: { id: string }) => {
      // ❌ BUG FIX: GetBookingUseCase fetches a SINGLE booking by ID.
      // Passing guest.id here will return null or the wrong data.
      // TODO: Implement GetBookingsForGuestUseCase. 
      // For now, return an empty array to avoid the "Cannot return null" error.
      return []; 
    },
  },

  // Note: The 'Review' field on the 'Booking' type should be handled 
  // by the Review Subgraph using the @key directive, 
  // not by a resolver inside the Booking Subgraph.
};