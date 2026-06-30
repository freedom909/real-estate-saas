// src/wisdom/memory/type/memory-context.ts
//
// MemoryContext — unified runtime context for all memory operations.
//
// Instead of each component deciding its own key (some use sessionId,
// some use userId, some use "default"), all storage methods receive
// a single MemoryContext that explicitly carries both identifiers.
//
// RULE: Never let components derive keys themselves.
//       Always pass MemoryContext from the orchestrator.
//
// ────────────────────────────────────────────────────────────────

import { Booking } from "@/core/booking/domain/entities/booking.entity";
import { AIContext, BookingDraft } from "@/wisdom/contracts/ai-context";


/**
 * Unified context passed to all memory subsystems.
 *
 * - `userId`   → long-term knowledge, summaries (user-scoped)
 * - `sessionId` → conversation buffer, session memory (session-scoped)
 */
export interface SessionMemoryState {
    searchResults?: ListingSummary[];
    bookingDraft?: BookingDraft;
    booking?: BookingMemory;
}

export interface ListingSummary {
    id: string;
    title: string;
    address: string;
    price: number;
    numOfGuests: number;
}

export interface KnowledgeSnapshot {
    preferences: Record<string, unknown>;

    facts: Record<string, unknown>;

    goals: Record<string, unknown>;

    summaries: string[];
}
export interface MemoryContext {

    // identity
    userId: string;
    sessionId: string;

    // session memory
    session: SessionMemoryState;

    // long term memory
    knowledge?: KnowledgeSnapshot; 
}

export interface BookingMemory {

    id?: string;

    listingId?: string;

    checkInDate?: string;

    checkOutDate?: string;

    guestCount?: number;

    status?: string;
}

export interface SessionMemoryState {

    booking?: BookingMemory;
    bookingDraft?: BookingDraft;
    searchResults?: ListingSummary[];
}
/**
 * Helper to extract MemoryContext from a WisdomRequest's AIContext.
 */
export function buildMemoryContext(
    context: AIContext
): MemoryContext {
        console.log(
        "AIContext.runtime",
        context.runtime
    );
    return {
        userId:
            context.identity.user?.id ??
            "anonymous",

        sessionId:
            context.runtime.sessionId ??
            "default",
        session: {},
    };
}