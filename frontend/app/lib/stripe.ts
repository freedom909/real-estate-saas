// src/wisdom-web/app/types/stripe.ts

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia" as Stripe.LatestApiVersion,
});
