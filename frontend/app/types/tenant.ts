// src/wisdom-web/app/types/tenant.ts
export interface Tenant {
  id: number;
  name: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive";
  createdAt: Date;
  stripeCustomerId?: string;
}