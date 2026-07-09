// // src/wisdom/memory/type/booking.memory.ts

import { BookingState } from "@/core/booking/domain/state/booking-state";

export interface BookingMemory {
    listingId?: string;
    listingTitle?: string;
    checkInDate?: string;
    checkOutDate?: string;
    customerCount?: number;
    contactName?: string;
    specialRequests?: string;
    status: BookingState;

}