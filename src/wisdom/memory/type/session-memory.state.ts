// // src/wisdom/memory/type/session-memory.state.ts


import { BookingDraft } from "@/wisdom/contracts/ai-context";
import {  ListingSummary } from "./memory-context";
import { BookingMemory } from "./booking.memory";


export interface SessionMemoryState { 

    searchResults?: ListingSummary[];

    bookingDraft?: BookingDraft;

    booking?: BookingMemory;
}