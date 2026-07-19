// Global in-memory cache for booking state between turns.
// Key: sessionId, Value: booking state (status, listingId, etc.)

const bookingCache = new Map<string, any>();

export function cacheBookingState(sessionId: string, state: any): void {
  bookingCache.set(sessionId, state);
  console.log("[BookingCache] Cached state for:", sessionId, "status:", state?.status);
}

export function getCachedBookingState(sessionId: string): any {
  const state = bookingCache.get(sessionId);
  console.log("[BookingCache] Retrieved state for:", sessionId, "status:", state?.status ?? "none");
  return state ?? {};
}
