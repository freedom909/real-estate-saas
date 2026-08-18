console.log("BOOKING RESOLVER LOADED");
import { CancelBookingUseCase } from "@/core/booking/application/usecases/cancel-booking.usecase";
import { CompleteBookingUseCase } from "@/core/booking/application/usecases/complete-booking.usecase";
import { ConfirmBookingUseCase } from "@/core/booking/application/usecases/confirm-booking.usecase";
import { CreateBookingUseCase } from "@/core/booking/application/usecases/create-booking.usecase";
import { GetBookingUseCase } from "@/core/booking/application/usecases/get-booking.usecase";
import { UpdateBookingUseCase } from "@/core/booking/application/usecases/update-booking.usecase";
import { CheckInBookingUseCase } from "@/core/booking/application/usecases/check-in-booking.usecase";
import { IBookingRepository } from "@/core/booking/domain/repositories/i-booking.repository";
import { requireAuth } from "@/infrastructure/auth/require.auth";
import { withAuthorization } from "@/infrastructure/auth/withAuthorization";
import { Action, Resource } from "@/subgraphs/user/domain/entities/types";
import { TOKENS_BOOKING } from "@/modules/tokens/booking.tokens";
import { container } from "tsyringe";
import { query } from "express";
import { GetBookingForUserUseCase } from "@/core/booking/application/usecases/getBookingForUser.usecase";
import { Role } from "@/core/shared/domain/role";
import ListingModel from "@/core/listing/infrastructure/models/listing.model";

export const resolvers = {
  Query: {
    booking: async (_: any, { id }: any) => {
      console.log("========== booking query ==========");
      console.log("booking id =", id);
      const booking = await container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(id);
      console.log("booking =", booking);
      return booking
    },
    bookingsForCustomer: async (_: any, { userId }: any) => {
      const repo =
        container.resolve<IBookingRepository>(
          TOKENS_BOOKING.repository.bookingRepository
        );

      return repo.findByCustomerId(userId);
    },
    myBookings: async (_: any, __: any, context: any) => {
      const user = await requireAuth(context);
      console.log("MY BOOKINGS USER =>", user);
      const userId = user.userId;
      const role = user.role;
      const bookingRepo = container.resolve<IBookingRepository>(
        TOKENS_BOOKING.repository.bookingRepository
      );

      // ADMIN/SUPER_ADMIN: see ALL bookings (global view)
      if (role === Role.ADMIN || role === Role.SUPER_ADMIN) {
        const allBookings = await bookingRepo.findAll({ page: 1, limit: 1000 });
        return allBookings.items;
      }

      // OWNER/HOST: return bookings for their listings + their own bookings as customer
      if (role === Role.OWNER || role === Role.HOST) {
        // Find listings owned by this user
        const listings = await ListingModel.findAll({
          where: { ownerId: userId },
          attributes: ["id"],
        });
        const ownerListingIds = listings.map((l: any) => l.id);

        // Get bookings for owner's listings
        const ownerBookings = ownerListingIds.length > 0
          ? await bookingRepo.findByListingIds(ownerListingIds)
          : [];

        // Also get bookings where user is the customer (e.g., they booked someone else's listing)
        const customerBookings = await bookingRepo.findByCustomerId(userId);

        // Merge and deduplicate by booking ID
        const bookingMap = new Map<string, any>();
        for (const b of [...ownerBookings, ...customerBookings]) {
          bookingMap.set(b.id, b);
        }
        return Array.from(bookingMap.values());
      }

      // For CUSTOMER: return only their own bookings
      return bookingRepo.findByCustomerId(userId);
    },
  },
  Mutation: {
    createBooking: withAuthorization(
  Action.CREATE,
  Resource.BOOKING,
  async (_: any, { input }: any, context: any) => {

    const user = context.user;

    if (!user) {
      throw new Error("Unauthenticated");
    }

    const booking = await container.resolve<CreateBookingUseCase>(
        TOKENS_BOOKING.usecase.createBookingUseCase
      )
      .execute(input, {
        customerId: user.userId,
        tenantId: user.tenantId,     
      });

    return {
      code: 200,
      success: true,
      message: "Your booking has been successfully created",
      booking,
    };
  }
),

    cancelBooking: withAuthorization(Action.CANCEL, Resource.BOOKING, async (_: any, { id, reason }: any) => {
      const usecase = container.resolve<CancelBookingUseCase>(TOKENS_BOOKING.usecase.cancelBookingUseCase);

      const booking = await usecase.execute(id, reason || "No reason provided");

      return {
        code: 200,
        success: true,
        message: "Booking cancelled",
        booking,
      };
    }, {
      resolveOwnerId: async (_ctx, { id }) => {
        const repo = container.resolve<IBookingRepository>(TOKENS_BOOKING.repository.bookingRepository);
        const booking = await repo.findById(id);
        if (!booking) return null;
        // Allow both the customer AND the listing owner to cancel
        const listing = await ListingModel.findByPk(booking.listingId);
        const ownerId = (listing as any)?.ownerId;
        // Return the listing owner so the host can cancel; the policy also allows the customer
        return ownerId ?? booking.customerId;
      },
    }),

    confirmBooking: withAuthorization(Action.CONFIRM, Resource.BOOKING, async (_: any, { id }: any) => {
      return await container
        .resolve<ConfirmBookingUseCase>(TOKENS_BOOKING.usecase.confirmBookingUseCase)
        .execute(id);
    }, {
      resolveOwnerId: async (_ctx, { id }) => {
        const repo = container.resolve<IBookingRepository>(
          TOKENS_BOOKING.repository.bookingRepository
        );
        const booking = await repo.findById(id);
        if (!booking) return null;

        // Return the LISTING OWNER's ID, not the customer ID
        // The listing owner is the one who should confirm bookings
        const listing = await ListingModel.findByPk(booking.listingId);
        return (listing as any)?.ownerId ?? booking.customerId;
      },
    }),

    completeBooking: withAuthorization(Action.COMPLETE, Resource.BOOKING, async (_: any, { id }: any) => {
      return await container.resolve<CompleteBookingUseCase>(TOKENS_BOOKING.usecase.completeBookingUseCase).execute(id);
    }),

    checkInBooking: withAuthorization(Action.CHECK_IN, Resource.BOOKING, async (_: any, { id }: any) => {
      return await container.resolve<CheckInBookingUseCase>(TOKENS_BOOKING.usecase.checkInBookingUseCase).execute(id);
    }, {
      resolveOwnerId: async (_ctx, { id }) => {
        const repo = container.resolve<IBookingRepository>(
          TOKENS_BOOKING.repository.bookingRepository
        );
        const booking = await repo.findById(id);
        if (!booking) return null;
        const listing = await ListingModel.findByPk(booking.listingId);
        return (listing as any)?.ownerId ?? booking.customerId;
      },
    }),

    updateBooking: withAuthorization(Action.UPDATE, Resource.BOOKING, async (_: any, { input }: any) => {
      const usecase = container.resolve<UpdateBookingUseCase>(TOKENS_BOOKING.usecase.updateBookingUseCase);
      const booking = await usecase.execute(input);
      return {
        code: 200,
        success: true,
        message: "Booking updated",
        booking,
      };
    }, {
      resolveOwnerId: async (_ctx, { input }) => {
        const repo = container.resolve<IBookingRepository>(TOKENS_BOOKING.repository.bookingRepository);
        const booking = await repo.findById(input.id);
        return booking?.customerId ?? null;
      },
    }),

    analyzeBookingFraud: async (_: any, { bookingId }: any) => {
      // Placeholder for fraud analysis
      return {
        agentName: "FraudAnalyzer",
        assessment: { riskScore: 0, factors: [] },
      };
    },
  },

  Booking: {
    listing: (parent: any) => ({ __typename: "Listing", id: parent.listingId || parent.listing_id }),

    customer: (parent) => ({
      __typename: "User",
      id: parent.customerId,
    }),

    tenant: (parent) => ({
      __typename: "Tenant",
      id: parent.tenantId,
    }),

    checkInDate: (parent: any) => parent.checkInDate || parent.dateRange?.checkInDate || parent.check_in_date,
    checkOutDate: (parent: any) => parent.checkOutDate || parent.dateRange?.checkOutDate || parent.check_out_date,
    price: (parent: any) => parent.price ?? parent.total_price ?? 0,
    lifecycleStatus: (parent: any) => parent.lifecycleStatus ?? parent.bookingLifecycleStatus ?? "UPCOMING",
    __resolveReference: async (reference: { id: string }) => {
      return container.resolve<GetBookingUseCase>(TOKENS_BOOKING.usecase.getBookingUseCase).execute(reference.id);
    },
    payment: (parent: any) => {
      console.log("BOOKING PARENT =", parent);

      return parent.payment ?? null;
    },
  },
};
