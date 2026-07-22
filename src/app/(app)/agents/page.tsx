import { AppShell } from "@/components/AppShell";
import { money } from "@/lib/format";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  const store = loadStore();

  return (
    <AppShell
      title="Agents"
      subtitle="Registered agents with spend caps, allowlists, and memory namespaces."
    >
      <div className="panel overflow-x-auto p-2">
        <table className="table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Risk tiers</th>
              <th>Spend</th>
              <th>Allowlist</th>
              <th>API key</th>
            </tr>
          </thead>
          <tbody>
            {store.agents.map((agent) => (
              <tr key={agent.id}>
                <td>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-[var(--muted)]">{agent.description}</div>
                  <div className="mono mt-1 text-xs text-[var(--muted)]">{agent.id}</div>
                </td>
                <td className="text-sm">{agent.riskTier.join(", ")}</td>
                <td className="text-sm">
                  {money(agent.spendUsedCents)} / {money(agent.spendCapCents)}
                </td>
                <td className="text-sm text-[var(--muted)]">
                  {agent.allowlist.join(", ") || "—"}
                </td>
                <td className="mono text-xs">{agent.apiKeyPreview}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Demo API key for Research Scout:{" "}
        <span className="mono text-[var(--ink)]">{store.demoApiKey}</span>
      </p>
    </AppShell>
  );
}
