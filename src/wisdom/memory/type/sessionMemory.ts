import { ConversationFocus } from "@/wisdom/conversation/context/conversation-state";
import { BookingMemory } from "./booking.memory";
import { EntityType } from "@/wisdom/semantic/semantic-context";

// src/wisdom/memory/type/sessionMemory.ts
export type SessionMemory = {
  sessionId: string;

  currentFocus?: SessionFocus;

  recentEntities: any[];

  searchResults?: any[];

  bookingDraft?: BookingMemory;

  updatedAt: number;
};

export interface SessionFocus {
  entityType: EntityType;
  entityId: string;
  source: string;
  timestamp: number;
}
