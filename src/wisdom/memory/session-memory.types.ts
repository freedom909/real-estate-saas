// // src/wisdom/memory/session-memory.types.ts

import { BookingDraft } from "../contracts/ai-context";
import { BookingMemory } from "./type/booking.memory";
import { ListingSummary } from "./type/memory-context";



export interface SessionMemoryState {
  searchResults?: ListingSummary[];
  bookingDraft?: BookingDraft;
  booking?: BookingMemory;
}

