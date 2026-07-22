import { AppShell } from "@/components/AppShell";
import { money, statusTone } from "@/lib/format";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function SpendPage() {
  const store = loadStore();

  return (
    <AppShell
      title="Spend & metering"
      subtitle="Per-agent spend caps and usage events generated from approved clearances."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {store.agents.map((agent) => {
          const pct = Math.min(
            100,
            Math.round((agent.spendUsedCents / agent.spendCapCents) * 100),
          );
          return (
            <div key={agent.id} className="panel p-5">
              <h2 className="display text-xl font-semibold">{agent.name}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {money(agent.spendUsedCents)} of {money(agent.spendCapCents)}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--muted)]">{pct}% of cap</p>
            </div>
          );
        })}
      </div>

      <div className="panel mt-6 overflow-x-auto p-2">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>When</th>
              <th>Agent</th>
              <th>Clearance</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {store.usage.map((u) => {
              const agent = store.agents.find((a) => a.id === u.agentId);
              return (
                <tr key={u.id}>
                  <td className="mono text-xs">{new Date(u.ts).toLocaleString()}</td>
                  <td>{agent?.name ?? u.agentId}</td>
                  <td className="mono text-xs">{u.clearanceId}</td>
                  <td>{money(u.amountCents)}</td>
                </tr>
              );
            })}
            {store.usage.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-[var(--muted)]">
                  No metered usage yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="panel mt-6 overflow-x-auto p-2">
        <h2 className="display px-2 pt-3 text-xl font-semibold">All clearances</h2>
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Action</th>
              <th>CHP</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {store.clearances.map((c) => (
              <tr key={c.id}>
                <td>
                  <div>{c.action}</div>
                  <div className="text-xs text-[var(--muted)]">{c.rationale}</div>
                </td>
                <td className={`tone-${statusTone(c.chpState)}`}>{c.chpState}</td>
                <td className={`tone-${statusTone(c.status)}`}>{c.status}</td>
                <td>{money(c.amountCents, c.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
