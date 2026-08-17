// src/core/calendar/domain/entities/calendar-slot.ts

import { CalendarDateRange } from "../value-objects/date-range.vo";
import { SlotStatus } from "../value-objects/slot-status";

export interface CalendarSlotProps {
  id: string;
  listingId: string;
  date: Date;            // the night date (YYYY-MM-DD)
  status: SlotStatus;
  bookingId?: string;    // which booking holds this slot
  blockedBy?: string;    // userId who blocked it (host)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CalendarSlot — one row per night per listing.
 *
 * Business rules:
 *  - A slot can only be in AVAILABLE → RESERVED → OCCUPIED → AVAILABLE
 *  - A slot can be AVAILABLE → BLOCKED → AVAILABLE (host toggle)
 *  - Only AVAILABLE slots can be reserved
 *  - Releasing a slot sets it back to AVAILABLE
 */
export class CalendarSlot {
  private props: CalendarSlotProps;

  private constructor(props: CalendarSlotProps) {
    this.props = props;
  }

  // ── Getters ──────────────────────────────────────────
  get id() { return this.props.id; }
  get listingId() { return this.props.listingId; }
  get date() { return this.props.date; }
  get status() { return this.props.status; }
  get bookingId() { return this.props.bookingId; }
  get blockedBy() { return this.props.blockedBy; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  // ── Factory ──────────────────────────────────────────
  static create(props: {
    id: string;
    listingId: string;
    date: Date;
    status?: SlotStatus;
    bookingId?: string;
    blockedBy?: string;
  }): CalendarSlot {
    const now = new Date();
    return new CalendarSlot({
      id: props.id,
      listingId: props.listingId,
      date: props.date,
      status: props.status ?? SlotStatus.AVAILABLE,
      bookingId: props.bookingId,
      blockedBy: props.blockedBy,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: CalendarSlotProps): CalendarSlot {
    return new CalendarSlot(props);
  }

  // ── Business Logic ───────────────────────────────────

  /** Reserve this slot for a booking */
  reserve(bookingId: string): void {
    if (this.props.status !== SlotStatus.AVAILABLE) {
      throw new Error(
        `Cannot reserve slot ${this.props.date.toISOString().slice(0, 10)} ` +
        `for listing ${this.props.listingId}: status is ${this.props.status}`
      );
    }
    this.props.status = SlotStatus.RESERVED;
    this.props.bookingId = bookingId;
    this.touch();
  }

  /** Release a reserved slot back to available */
  release(): void {
    if (this.props.status !== SlotStatus.RESERVED && this.props.status !== SlotStatus.OCCUPIED) {
      throw new Error(
        `Cannot release slot ${this.props.date.toISOString().slice(0, 10)}: ` +
        `status is ${this.props.status}`
      );
    }
    this.props.status = SlotStatus.AVAILABLE;
    this.props.bookingId = undefined;
    this.touch();
  }

  /** Guest checks in — slot becomes occupied */
  checkIn(): void {
    if (this.props.status !== SlotStatus.RESERVED) {
      throw new Error("Only RESERVED slots can be checked in");
    }
    this.props.status = SlotStatus.OCCUPIED;
    this.touch();
  }

  /** Host blocks this date */
  block(userId: string): void {
    if (this.props.status !== SlotStatus.AVAILABLE) {
      throw new Error(
        `Cannot block slot: status is ${this.props.status}`
      );
    }
    this.props.status = SlotStatus.BLOCKED;
    this.props.blockedBy = userId;
    this.touch();
  }

  /** Host unblocks this date */
  unblock(): void {
    if (this.props.status !== SlotStatus.BLOCKED) {
      throw new Error("Only BLOCKED slots can be unblocked");
    }
    this.props.status = SlotStatus.AVAILABLE;
    this.props.blockedBy = undefined;
    this.touch();
  }

  isAvailable(): boolean {
    return this.props.status === SlotStatus.AVAILABLE;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      listingId: this.props.listingId,
      date: this.props.date,
      status: this.props.status,
      bookingId: this.props.bookingId,
      blockedBy: this.props.blockedBy,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
