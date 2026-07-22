// src/wisdom-web/app/types/subscription.ts
export interface Subscription {
  id: string;
  tenantId: string;

  stripeSubscriptionId: string;
  stripePriceId: string;

  status: "active" | "past_due" | "canceled";

  currentPeriodEnd: Date;
}