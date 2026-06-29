// session memory types

import { BookingDraft } from "../contracts/ai-context";
import { ListingSummary } from "./type/memory-context";

// src/wisdom/memory/session-memory.types.ts

export interface SessionMemoryState {
  searchResults?: ListingSummary[];
  bookingDraft?: BookingDraft;
  booking?: BookingMemory;
}

export interface BookingMemory {
  id?: string;
  listingId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestCount?: number;
}