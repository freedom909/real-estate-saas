// src/wisdom-web/app/types/plan.ts
export const PLANS = {
  free: {
    priceId: null,
    listingsLimit: 5,
  },
  pro: {
    priceId: "price_xxx_pro",
    listingsLimit: 100,
  },
  enterprise: {
    priceId: "price_xxx_enterprise",
    listingsLimit: Infinity,
  },
};