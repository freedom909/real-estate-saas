// src/wisdom-web/app/controller/subscription.controller.ts


import { PLANS } from "../config/plan";
import { stripe } from "../lib/stripe";

export async function createCheckoutSession(req: Request, res: Response, db: Database) {
  const { tenantId, plan } = req.body as unknown as { tenantId: string; plan: string };

  const tenant = await db.tenant.findById(tenantId);

  // 1. 创建 Stripe Customer（如果没有）
  let customerId = tenant.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: tenant.name,
      metadata: { tenantId },
    });

    customerId = customer.id;

    await db.tenant.update(tenantId, {
      stripeCustomerId: customerId,
    });
  }

  // 2. 创建 Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,

    line_items: [
      {
        price: PLANS[plan as keyof typeof PLANS].priceId || "",
        quantity: 1,
      },
    ],

    success_url: `${process.env.FRONTEND_URL}/billing/success`,
    cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,

    metadata: {
      tenantId,
      plan,
    },
  });

  return res.json();
}