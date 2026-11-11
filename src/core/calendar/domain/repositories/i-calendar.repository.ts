// src/core/calendar/domain/repositories/i-calendar.repository.ts

import { CalendarSlot } from "../entities/calendar-slot";

export interface ICalendarRepository {

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
   * Inserts new rows; updates rows that already exist (release/unblock paths).
   */
  saveAll(slots: CalendarSlot[]): Promise<void>;

  /**
   * Atomically claim an EXISTING AVAILABLE slot for a booking
   * (compare-and-set: only succeeds if the row is still AVAILABLE).
   * Returns false if the slot was taken concurrently (or is not AVAILABLE).
   */
  tryReserve(slotId: string, bookingId: string): Promise<boolean>;

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

  /**
   * Reserve a range of slots for a booking.
   * Returns the number of slots reserved.
   */
  reserveRange(
    listingId: string,
    bookingId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<number>;
    /**
   * Release RESERVED slots belonging to this booking only.
   */
  releaseByBookingId(bookingId: string): Promise<void>;
}
