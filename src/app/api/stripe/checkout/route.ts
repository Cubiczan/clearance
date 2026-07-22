import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, PLAN_CATALOG, stripeMode } from "@/lib/stripe";
import { loadStore, mutateStore } from "@/lib/store";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  plan: z.enum(["starter", "pro", "enterprise"]),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = parsed.data.plan as PlanId;
  const stripe = getStripe();
  const store = loadStore();
  const origin = new URL(req.url).origin;

  if (!stripe || plan === "enterprise") {
    const org = mutateStore((s) => {
      s.org.plan = plan;
      s.org.clearanceQuota = PLAN_CATALOG[plan].quota;
      return s.org;
    });
    return NextResponse.json({
      mode: stripeMode(),
      simulated: true,
      message:
        plan === "enterprise"
          ? "Enterprise plan flagged for sales — demo activated locally"
          : "Stripe not configured — plan updated in demo mode",
      org,
      catalog: PLAN_CATALOG[plan],
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${origin}/billing?success=1`,
    cancel_url: `${origin}/billing?canceled=1`,
    customer_email: "ops@acme.example",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Clearance ${PLAN_CATALOG[plan].name}`,
            description: PLAN_CATALOG[plan].blurb,
          },
          unit_amount: PLAN_CATALOG[plan].priceCents,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    metadata: {
      orgId: store.org.id,
      plan,
    },
  });

  return NextResponse.json({ mode: stripeMode(), url: session.url, sessionId: session.id });
}
