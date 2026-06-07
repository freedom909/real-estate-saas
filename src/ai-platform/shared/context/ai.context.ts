//// ai-platform/shared/context/ai.context.ts

export interface AIContext {
  userId: string;

  tenantId?: string;

  correlationId?: string;

  source:
    | "web"
    | "mobile"
    | "voice"
    | "api";
}