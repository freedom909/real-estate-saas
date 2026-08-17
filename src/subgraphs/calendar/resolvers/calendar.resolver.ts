// src/subgraphs/calendar/resolvers/calendar.resolver.ts

import { container } from "tsyringe";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ReserveSlotUseCase } from "@/core/calendar/application/usecases/reserve-slot.usecase";
import { ReleaseSlotUseCase } from "@/core/calendar/application/usecases/release-slot.usecase";
import { GetAvailabilityUseCase } from "@/core/calendar/application/usecases/get-availability.usecase";
import { BlockDatesUseCase } from "@/core/calendar/application/usecases/block-dates.usecase";
import { ICalendarRepository } from "@/core/calendar/domain/repositories/i-calendar.repository";

export const resolvers = {
  Query: {
    checkAvailability: async (_: any, { input }: any) => {
      const useCase = container.resolve<GetAvailabilityUseCase>(
        TOKENS_CALENDAR.usecase.getAvailabilityUseCase
      );
      return useCase.execute(input);
    },

    calendarSlotsByListing: async (_: any, { listingId }: { listingId: string }) => {
      const repo = container.resolve<ICalendarRepository>(
        TOKENS_CALENDAR.repos.calendarRepository
      );
      const slots = await repo.findAllByListing(listingId);
      return slots.map((s) => s.toJSON());
    },

    calendarSlotsByBooking: async (_: any, { bookingId }: { bookingId: string }) => {
      const repo = container.resolve<ICalendarRepository>(
        TOKENS_CALENDAR.repos.calendarRepository
      );
      const slots = await repo.findByBookingId(bookingId);
      return slots.map((s) => s.toJSON());
    },
  },

  Mutation: {
    reserveCalendarSlots: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const useCase = container.resolve<ReserveSlotUseCase>(
        TOKENS_CALENDAR.usecase.reserveSlotUseCase
      );
      return useCase.execute(input);
    },

    releaseCalendarSlots: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const useCase = container.resolve<ReleaseSlotUseCase>(
        TOKENS_CALENDAR.usecase.releaseSlotUseCase
      );
      return useCase.execute(input);
    },

    blockCalendarDates: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      const useCase = container.resolve<BlockDatesUseCase>(
        TOKENS_CALENDAR.usecase.blockDatesUseCase
      );
      return useCase.execute({ ...input, userId: context.user.userId });
    },
  },

  // ── Federation: Listing.calendarSlots ──────────────
  Listing: {
    calendarSlots: async (listing: any) => {
      // When another subgraph resolves a Listing, we can provide calendar data
      const repo = container.resolve<ICalendarRepository>(
        TOKENS_CALENDAR.repos.calendarRepository
      );
      const slots = await repo.findAllByListing(listing.id);
      return slots.map((s) => s.toJSON());
    },
  },
};
