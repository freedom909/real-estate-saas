// src/wisdom/conversation/context/conversation-state.ts

import { BookingTransitionEvent } from "@/core/booking/domain/state/booking-event";
import { EntityType } from "@/wisdom/semantic/semantic-context";

export interface ConversationState {
  bookingDraft(bookingDraft: any, event: BookingTransitionEvent): any;
  updatedAt: number;
   recentEntities: SessionEntity[];
  currentFocus: ConversationFocus;
  sessionId: string;

  focus?: {
    entityType: EntityType;
    entityId: string;
  };

  selected?: {
    entityType: EntityType;
    entityId: string;
  };

  recent?: Array<{
    entityType: EntityType;
    entityId: string;
    timestamp: number;
  }>;
}

export interface ConversationFocus {
  entityType: EntityType;
  entityId: string;
  source: string;
  timestamp: number;
}

export interface SessionEntity {
  entityType: EntityType;
  entityId: string;
  source: string;
  timestamp: number;
}