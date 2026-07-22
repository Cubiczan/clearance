import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ClearancePlayground } from "@/components/ClearancePlayground";
import { money, statusTone } from "@/lib/format";
import { dashboardStats } from "@/lib/clearance";
import { backboardConfig } from "@/lib/memory";
import { loadStore, verifyAuditChain } from "@/lib/store";
import { stripeMode } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const store = loadStore();
  const stats = dashboardStats(store);
  const chain = verifyAuditChain(store);
  const bb = backboardConfig();

  return (
    <AppShell
      title="Control plane"
      subtitle={`${store.org.name} · ${stats.plan} plan · Stripe ${stripeMode()}`}
    >
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Agents", String(stats.agents)],
          ["Open approvals", String(stats.openApprovals)],
          ["Spend used", money(stats.spendCents)],
          ["Clearances", `${stats.clearanceUsed}/${stats.clearanceQuota}`],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <div className="text-sm text-[var(--muted)]">{label}</div>
            <div className="display mt-2 text-3xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="panel p-4">
          <div className="text-sm text-[var(--muted)]">Audit chain</div>
          <div className={`display mt-2 text-2xl font-semibold tone-${statusTone(chain.intact ? "intact" : "denied")}`}>
            {chain.intact ? "Intact" : `Broken @ ${chain.firstBadIndex}`}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">
            HMAC-SHA256 append-only ledger with signature chaining.
          </p>
        </div>
        <div className="panel p-4">
          <div className="text-sm text-[var(--muted)]">Memory / RAG</div>
          <div className="display mt-2 text-2xl font-semibold">
            {bb.enabled ? "Backboard live" : "Demo memory"}
          </div>
          <p className="mt-2 text-sm text-[var(--muted)]">{bb.note}</p>
        </div>
      </div>

      <div className="mt-6">
        <ClearancePlayground agents={store.agents.map((a) => ({ id: a.id, name: a.name }))} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-xl font-semibold">Recent clearances</h2>
            <Link href="/spend" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              View spend →
            </Link>
          </div>
          <table className="table text-sm">
            <thead>
              <tr>
                <th>Action</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {store.clearances.slice(0, 6).map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="font-medium">{c.action}</div>
                    <div className="mono text-xs text-[var(--muted)]">{c.vendor || "—"}</div>
                  </td>
                  <td className={`tone-${statusTone(c.status)}`}>{c.status}</td>
                  <td>{money(c.amountCents, c.currency)}</td>
                </tr>
              ))}
              {store.clearances.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-[var(--muted)]">
                    No clearances yet — run the playground above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="panel p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-xl font-semibold">Open approvals</h2>
            <Link href="/approvals" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
              Review queue →
            </Link>
          </div>
          <div className="grid gap-3">
            {store.approvals
              .filter((a) => a.status === "open")
              .slice(0, 5)
              .map((a) => (
                <div key={a.id} className="rounded-xl border border-[var(--line)] p-3">
                  <div className="font-medium">{a.summary}</div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{a.id}</div>
                </div>
              ))}
            {store.approvals.filter((a) => a.status === "open").length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                Queue empty. Try a payment above $250 to force human CHP review.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
