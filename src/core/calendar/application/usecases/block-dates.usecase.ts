// src/core/calendar/application/usecases/block-dates.usecase.ts

import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";
import { CalendarSlot } from "../../domain/entities/calendar-slot";
import { CalendarDateRange } from "../../domain/value-objects/date-range.vo";
import { SlotStatus } from "../../domain/value-objects/slot-status";

export interface BlockDatesInput {
  listingId: string;
  userId: string;       // host who blocks
  checkIn: string;
  checkOut: string;
}

/**
 * Host blocks dates on their listing (maintenance, personal use, etc.)
 * Only AVAILABLE slots can be blocked.
 * If any slot is RESERVED/OCCUPIED, the block fails.
 */
@injectable()
export class BlockDatesUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private repo: ICalendarRepository
  ) {}

  async execute(input: BlockDatesInput) {
    const checkIn = new Date(input.checkIn);
    const checkOut = new Date(input.checkOut);

    const range = new CalendarDateRange(checkIn, checkOut);
    const nights = range.nights();

    // Check for conflicts (RESERVED/OCCUPIED slots)
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
        `Cannot block: some dates are already booked. Conflicts: ${conflictDates.join(", ")}`
      );
    }

    // Check existing slots — update if exists, create if not
    const existingSlots = await this.repo.findSlots(
      input.listingId,
      checkIn,
      checkOut
    );
    const existingMap = new Map(
      existingSlots.map((s) => [s.date.toISOString().slice(0, 10), s])
    );

    const slotsToSave: CalendarSlot[] = nights.map((night) => {
      const key = night.toISOString().slice(0, 10);
      const existing = existingMap.get(key);

      if (existing) {
        // Existing AVAILABLE slot → block it
        existing.block(input.userId);
        return existing;
      }

      // No slot yet → create blocked
      return CalendarSlot.create({
        id: uuidv4(),
        listingId: input.listingId,
        date: night,
        status: SlotStatus.BLOCKED,
        blockedBy: input.userId,
      });
    });

    await this.repo.saveAll(slotsToSave);

    return {
      blocked: slotsToSave.length,
      listingId: input.listingId,
      checkIn: nights[0].toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
    };
  }
}
