// src/core/calendar/domain/service/availability.service.ts

import { injectable } from "tsyringe";
import { ICalendarRepository } from "../repositories/i-calendar.repository";
import { CalendarSlot } from "../entities/calendar-slot";
import { CalendarDateRange } from "../value-objects/date-range.vo";
import { SlotStatus } from "../value-objects/slot-status";

export interface AvailabilityResult {
  available: boolean;
  listingId: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  availableNights: number;
  unavailableDates: string[];
  slots: Array<{
    date: string;
    status: SlotStatus;
    bookingId?: string;
  }>;
}

/**
 * Domain service — pure availability logic.
 * No side effects, no DB access. Takes repository results and computes.
 */
@injectable()
export class CalendarAvailabilityService {
  /**
   * Check if a date range is fully available for a listing.
   */
  async checkAvailability(
    repo: ICalendarRepository,
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<AvailabilityResult> {
    const range = new CalendarDateRange(checkIn, checkOut);
    const nights = range.nights();
    const existingSlots = await repo.findSlots(listingId, checkIn, checkOut);

    // Build a map of date → slot
    const slotMap = new Map<string, CalendarSlot>();
    for (const slot of existingSlots) {
      const key = slot.date.toISOString().slice(0, 10);
      slotMap.set(key, slot);
    }

    const unavailableDates: string[] = [];
    const slotDetails: AvailabilityResult["slots"] = [];

    for (const night of nights) {
      const key = night.toISOString().slice(0, 10);
      const slot = slotMap.get(key);

      if (slot && !slot.isAvailable()) {
        unavailableDates.push(key);
        slotDetails.push({
          date: key,
          status: slot.status,
          bookingId: slot.bookingId,
        });
      } else {
        slotDetails.push({
          date: key,
          status: slot?.status ?? SlotStatus.AVAILABLE,
        });
      }
    }

    return {
      available: unavailableDates.length === 0,
      listingId,
      checkIn: nights[0].toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      totalNights: nights.length,
      availableNights: nights.length - unavailableDates.length,
      unavailableDates,
      slots: slotDetails,
    };
  }
}
