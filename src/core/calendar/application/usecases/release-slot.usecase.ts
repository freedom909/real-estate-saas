// src/core/calendar/application/usecases/release-slot.usecase.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_CALENDAR } from "@/modules/tokens/calendar.tokens";
import { ICalendarRepository } from "../../domain/repositories/i-calendar.repository";

export interface ReleaseSlotInput {
  bookingId: string;
  reason?: string;
}

/**
 * Release all calendar slots held by a booking.
 *
 * Called when:
 *  - Guest cancels a booking
 *  - Booking expires (pending → expired)
 *  - Host rejects a pending booking
 *
 * Sets all RESERVED/OCCUPIED slots back to AVAILABLE.
 * Idempotent: if no slots found, returns success.
 */
@injectable()
export class ReleaseSlotUseCase {
  constructor(
    @inject(TOKENS_CALENDAR.repos.calendarRepository)
    private repo: ICalendarRepository
  ) {}

  async execute(input: ReleaseSlotInput) {
    const slots = await this.repo.findByBookingId(input.bookingId);

    if (slots.length === 0) {
      return {
        released: 0,
        bookingId: input.bookingId,
        message: "No calendar slots found for this booking (already released or never reserved)",
      };
    }

    // Release each slot
    for (const slot of slots) {
      try {
        slot.release();
      } catch {
        // Slot might already be in a non-releasable state (e.g. BLOCKED by host)
        // Skip it — don't fail the entire release
        console.warn(
          `⚠️ Could not release slot ${slot.date.toISOString().slice(0, 10)} ` +
          `for listing ${slot.listingId}: ${slot.status}`
        );
      }
    }

    await this.repo.saveAll(slots);

    return {
      released: slots.length,
      bookingId: input.bookingId,
      reason: input.reason,
    };
  }
}
