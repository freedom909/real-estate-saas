// src/core/calendar/domain/repositories/i-calendar.repository.ts

import { CalendarSlot } from "../entities/calendar-slot";
import { SlotStatus } from "../value-objects/slot-status";

export interface ICalendarRepository {
  getSlotsByListing(listingId: string): Promise<CalendarSlot[]>;
  /**
   * Find all slots for a listing within a date range.
   * Used for availability checks and overlap detection.
   */
  findSlots(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<CalendarSlot[]>;

  /**
   * Find all slots for a listing (no date filter).
   */
  findAllByListing(listingId: string): Promise<CalendarSlot[]>;

  /**
   * Find slots by booking ID — used to release on cancellation.
   */
  findByBookingId(bookingId: string): Promise<CalendarSlot[]>;

  /**
   * Find a single slot by listing + date.
   */
  findByListingAndDate(listingId: string, date: Date): Promise<CalendarSlot | null>;

  /**
   * Batch save — used to atomically reserve/release multiple nights.
   */
  saveAll(slots: CalendarSlot[]): Promise<void>;

  /**
   * Check if ALL dates in range are available (atomic query).
   * Returns the list of conflicting slots if any are not available.
   */
  findConflicts(
    listingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<CalendarSlot[]>;

  /**
   * Delete all slots for a listing (cleanup).
   */
  deleteByListing(listingId: string): Promise<void>;
}
