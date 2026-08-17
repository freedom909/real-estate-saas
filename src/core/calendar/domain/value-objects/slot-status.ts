// src/core/calendar/domain/value-objects/slot-status.ts

export enum SlotStatus {
  /** Available for booking */
  AVAILABLE = "AVAILABLE",
  /** Reserved by a pending/confirmed booking (not yet checked in) */
  RESERVED = "RESERVED",
  /** Blocked by host (maintenance, personal use, etc.) */
  BLOCKED = "BLOCKED",
  /** Currently occupied (guest has checked in) */
  OCCUPIED = "OCCUPIED",
}
