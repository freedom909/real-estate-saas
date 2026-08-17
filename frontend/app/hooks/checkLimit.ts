// src/wisdom-web/app/hooks/checkLimit.ts

import { PLANS } from "../config/plan";

// Stub type — this hook is not yet wired up
type Database = any;

export async function checkListingLimit(tenantId: string, db: Database) {
  const tenant = await db.tenant.findById(tenantId);

  const count = await db.listing.count({
    tenantId,
  });

  const limit = PLANS[tenant.plan as keyof typeof PLANS].listingsLimit;

  if (count >= limit) {
    throw new Error("Plan limit reached. Upgrade required.");
  }
}
