import { AppShell } from "@/components/AppShell";
import { BillingPanel } from "@/components/BillingPanel";
import { loadStore } from "@/lib/store";
import { PLAN_CATALOG, stripeMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const store = loadStore();
  const params = await searchParams;
  const plan = PLAN_CATALOG[store.org.plan];

  return (
    <AppShell
      title="Billing"
      subtitle="Seat subscriptions with metered clearance overages. Live Stripe when configured."
    >
      {params.success ? (
        <div className="panel mb-4 border-[rgba(61,220,151,0.35)] p-4 tone-ok">
          Checkout completed — subscription provisioning via webhook.
        </div>
      ) : null}
      {params.canceled ? (
        <div className="panel mb-4 p-4 text-[var(--muted)]">Checkout canceled.</div>
      ) : null}

      <div className="panel mb-6 p-5">
        <div className="text-sm text-[var(--muted)]">Current plan</div>
        <div className="display mt-1 text-3xl font-semibold capitalize">{store.org.plan}</div>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {plan.blurb} · quota {store.org.clearanceUsed}/{store.org.clearanceQuota}
        </p>
      </div>

      <BillingPanel currentPlan={store.org.plan} stripeMode={stripeMode()} />
    </AppShell>
  );
}
