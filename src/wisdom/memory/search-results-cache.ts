// Global in-memory cache for search results between turns.
// Key: sessionId, Value: listings from last search

const searchCache = new Map<string, any[]>();

export function cacheSearchResults(sessionId: string, listings: any[]): void {
  console.log("[SearchCache] Caching", listings.length, "listings for session:", sessionId);
  searchCache.set(sessionId, listings);
}

export function getCachedSearchResults(sessionId: string): any[] {
  const results = searchCache.get(sessionId) ?? [];
  console.log("[SearchCache] Retrieved", results.length, "listings for session:", sessionId);
  return results;
}
