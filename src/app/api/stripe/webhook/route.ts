import { NextResponse } from "next/server";
import { getStripe, PLAN_CATALOG } from "@/lib/stripe";
import { appendAudit, mutateStore } from "@/lib/store";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({
      received: true,
      demo: true,
      message: "Webhook accepted in demo mode (no STRIPE_WEBHOOK_SECRET)",
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid signature" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const plan = (session.metadata?.plan || "pro") as PlanId;
    mutateStore((store) => {
      store.org.plan = plan;
      store.org.clearanceQuota = PLAN_CATALOG[plan]?.quota ?? store.org.clearanceQuota;
      store.org.stripeCustomerId =
        typeof session.customer === "string" ? session.customer : store.org.stripeCustomerId;
      store.org.stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : store.org.stripeSubscriptionId;
      appendAudit(store, {
        orgId: store.org.id,
        event: "billing.subscription_activated",
        actor: "stripe.webhook",
        inputs: { plan, sessionId: session.id },
        sources: ["stripe"],
        confidence: "high",
        rationale: `Provisioned ${plan} via Stripe checkout`,
      });
    });
  }

  return NextResponse.json({ received: true });
}
