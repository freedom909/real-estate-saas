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
 * Uses findConflicts + compare-and-set claims + batch saveAll for atomicity.
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

    // ── Step 2: Claim each night ──
    // Reuse existing AVAILABLE rows when present (e.g. rows left by a released
    // booking — one row per (listingId, date) ever exists thanks to the unique
    // index). Reused rows are claimed with a compare-and-set (tryReserve) so a
    // concurrent request cannot grab the same night twice.
    const existing = await this.repo.findSlots(
      input.listingId,
      checkIn,
      checkOut
    );
    const byDate = new Map(
      existing.map((s) => [s.date.toISOString().slice(0, 10), s])
    );

    const created: CalendarSlot[] = [];
    const claimed: CalendarSlot[] = [];

    try {
      for (const night of nights) {
        const key = night.toISOString().slice(0, 10);
        const row = byDate.get(key);

        if (row) {
          const won = await this.repo.tryReserve(row.id, input.bookingId);
          if (!won) {
            throw new Error(
              `Cannot reserve: night ${key} was taken concurrently for listing ${input.listingId}`
            );
          }
          row.reserve(input.bookingId); // sync in-memory entity (AVAILABLE → RESERVED)
          claimed.push(row);
        } else {
          created.push(
            CalendarSlot.create({
              id: uuidv4(),
              listingId: input.listingId,
              date: night,
              status: SlotStatus.RESERVED,
              bookingId: input.bookingId,
            })
          );
        }
      }

      // ── Step 3: Batch save new rows (single transaction; the unique index
      // on (listingId, date) still guards against concurrent inserts) ──
      if (created.length > 0) {
        await this.repo.saveAll(created);
      }
    } catch (error) {
      // Compensate: release rows claimed by THIS call so a partial failure
      // never leaves orphan reservations behind.
      for (const row of claimed) {
        try {
          row.release();
        } catch {
          // already released — ignore
        }
      }
      if (claimed.length > 0) {
        await this.repo.saveAll(claimed).catch(() => {
          console.error("CRITICAL: failed to roll back claimed calendar slots");
        });
      }
      throw error;
    }

    return {
      reserved: nights.length,
      listingId: input.listingId,
      bookingId: input.bookingId,
      checkIn: nights[0].toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
    };
  }
}
