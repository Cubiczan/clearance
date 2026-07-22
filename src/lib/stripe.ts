import Stripe from "stripe";
import type { PlanId } from "./types";

export const PLAN_CATALOG: Record<
  PlanId,
  { name: string; priceCents: number; quota: number; agents: number; blurb: string }
> = {
  starter: {
    name: "Starter",
    priceCents: 4900,
    quota: 2000,
    agents: 3,
    blurb: "3 agents, 2k clearances, email HITL, signed ledger export",
  },
  pro: {
    name: "Pro",
    priceCents: 19900,
    quota: 25000,
    agents: 25,
    blurb: "25 agents, 25k clearances, Slack-ready approvals, usage overage",
  },
  enterprise: {
    name: "Enterprise",
    priceCents: 0,
    quota: 1_000_000,
    agents: 1000,
    blurb: "Custom policies, SSO, audit API, dedicated memory namespace",
  },
};

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function stripeMode(): "live" | "test" | "demo" {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return "demo";
  return key.startsWith("sk_live") ? "live" : "test";
}
