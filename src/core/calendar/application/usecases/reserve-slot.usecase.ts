// src/core/calendar/application/usecases/reserve-slot.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { CalendarSlot } from "../../domain/entities/calendar-slot";
import { CalendarDateRange } from "../../domain/value-objects/date-range.vo";
import { SlotStatus } from "../../domain/value-objects/slot-status";

export interface ReserveSlotInput {
  listingId: string;
  bookingId: string;
  checkIn: string;   // ISO date string
  checkOut: string;  // ISO date string
}

/**
 * Reserve calendar slots for a new booking.
 *
 * CRITICAL: This is the ONLY path to create RESERVED slots.
 * Uses findConflicts + batch saveAll for atomicity.
 * If ANY night is unavailable, the entire reservation fails.
 */
@injectable()
export class ReserveSlotUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private repo: ICalendarRepository
  ) {}

  async execute(input: ReserveSlotInput) {
    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error("Invalid date format");
    }

    const range = new CalendarDateRange(checkIn, checkOut);
    const nights = range.nights();

    // ── Step 1: Check for conflicts (DB-level) ──
    const conflicts = await this.repo.findConflicts(
      input.listingId,
      checkIn,
      checkOut
    );

    if (conflicts.length > 0) {
      const conflictDates = conflicts.map(
        (c) => `${c.date.toISOString().slice(0, 10)} (${c.status})`
      );
      throw new Error(
        `Cannot reserve: dates already occupied for listing ${input.listingId}. ` +
        `Conflicts: ${conflictDates.join(", ")}`
      );
    }

    // ── Step 2: Create all night slots ──
    const slots: CalendarSlot[] = nights.map((night) =>
      CalendarSlot.create({
        id: uuidv4(),
        listingId: input.listingId,
        date: night,
        status: SlotStatus.RESERVED,
        bookingId: input.bookingId,
      })
    );

    // ── Step 3: Batch save (single transaction) ──
    await this.repo.saveAll(slots);

    return {
      reserved: slots.length,
      listingId: input.listingId,
      bookingId: input.bookingId,
      checkIn: nights[0].toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
    };
  }
}
