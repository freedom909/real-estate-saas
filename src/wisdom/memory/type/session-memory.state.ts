//


import { BookingDraft } from "@/wisdom/contracts/ai-context";
import { BookingMemory, ListingSummary } from "./memory-context";


export interface SessionMemoryState {

    searchResults?: ListingSummary[];

    bookingDraft?: BookingDraft;

    booking?: BookingMemory;
}