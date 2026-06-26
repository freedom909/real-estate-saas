// src/wisdom/memory/session-memory.ts

// src/wisdom/memory/session-memory.ts

export const sessionMemory =
  new Map<string,
    {
      searchResults?: any[];
      bookingDraft?: any;
      booking?: any;
    }
  >();