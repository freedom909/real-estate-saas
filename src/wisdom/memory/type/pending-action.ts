//src/wisdom/memory/type/pending-action.ts


import { AgentAction } from "@/wisdom/shared/enums/action.enum";
import { AIDomain } from "@/wisdom/shared/enums/domain.enum";

/**
 * An action waiting for explicit user confirmation.
 *
 * This is different from BookingMemory:
 * - BookingMemory stores booking progress and collected information.
 * - PendingAction stores an operation awaiting confirmation.
 */
export interface PendingAction {
  /** The action that will be executed after confirmation. */
  action: AgentAction;

  /** The business domain that owns this action. */
  domain: AIDomain;

  /** Optional target resource, such as bookingId or listingId. */
  resourceId?: string;

  /** Optional context needed to execute the action. */
  payload?: Record<string, unknown>;

  /** When this confirmation request was created. */
  createdAt: number;

  /** When this confirmation request expires. */
  expiresAt: number;
}
