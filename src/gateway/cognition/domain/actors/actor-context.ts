// src/gateway/cognition/application/context/actor-context.ts
export interface ActorContext {
  actorId: string;
  role: string;
  tenantId: string;
  permissions?: string[]; // Optional, depending on granularity needed
}