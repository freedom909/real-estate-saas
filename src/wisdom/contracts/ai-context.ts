// src/wisdom/contracts/ai-context.ts
// Replaces the deleted @/ai-platform/context/types/context/ai.context.ts

export interface AIUser {
  id: string;
  email?: string;
  role?: string;
}

export interface IdentityContext {
  user?: AIUser;
  tenant?: string;
}

export interface RuntimeContext {
  source: "web" | "mobile" | "voice" | "api";
  locale?: string;
  timezone?: string;
  sessionId?: string;
  device?: {
    type: string;
    [key: string]: any;
  };
  ui?: {
    screen?: string;
    component?: string;
  };
  voice?: {
    transcriptConfidence?: number;
  };
}

export interface ResourceContext {
  listingId?: string;
  bookingId?: string;
  reviewId?: string;
  [key: string]: any;
}

export interface TraceContext {
  correlationId: string;
}

export interface AIContext {
  identity: IdentityContext;
  runtime: RuntimeContext;
  resources: ResourceContext;
  trace: TraceContext;
}

export interface AIRequest {
  message: string;
  context: AIContext;
}
