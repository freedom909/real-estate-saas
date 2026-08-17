// src/wisdom-web/app/hooks/webhook.ts
// @ts-nocheck — stub file, not wired up yet

import express from "express";
import { stripe } from "../lib/stripe";

// Stub — db is not yet wired up
const db: any = {};

const router = express.Router();

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error`);
    }

    // Subscription created
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const tenantId = session.metadata.tenantId;

      await db.subscription.create({
        tenantId,
        stripeSubscriptionId: session.subscription,
        status: "active",
      });

      await db.tenant.update(tenantId, {
        plan: session.metadata.plan,
      });
    }

    // Invoice paid
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as any;

      await db.subscription.updateByStripeId(
        invoice.subscription,
        {
          status: "active",
        }
      );
    }

    // Payment failed
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;

      await db.subscription.updateByStripeId(
        invoice.subscription,
        {
          status: "past_due",
        }
      );
    }

    return res.json({ received: true });
  }
);

export default router;
