"use client";

import { useState } from "react";

export function ClearancePlayground({
  agents,
}: {
  agents: { id: string; name: string }[];
}) {
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [action, setAction] = useState("payment.transfer");
  const [vendor, setVendor] = useState("stripe.com");
  const [amount, setAmount] = useState("180.00");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const amountCents = Math.round(parseFloat(amount || "0") * 100);
      const res = await fetch("/api/v1/clearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          action,
          vendor,
          amountCents,
          context: { source: "dashboard-playground" },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="display text-xl font-semibold">Request clearance</h2>
          <p className="text-sm text-[var(--muted)]">
            Simulate an agent action against policy + CHP.
          </p>
        </div>
        <span className="pill">
          <span className="live-dot" /> live gate
        </span>
      </div>
      <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Agent</span>
          <select
            className="select"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Action</span>
          <select
            className="select"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            <option value="payment.transfer">payment.transfer</option>
            <option value="research.query">research.query</option>
            <option value="email.send">email.send</option>
            <option value="refund.issue">refund.issue</option>
            <option value="tool.invoke">tool.invoke</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Vendor</span>
          <input
            className="input"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="stripe.com"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted)]">Amount (USD)</span>
          <input
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="250.00"
          />
        </label>
        <div className="md:col-span-2">
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Evaluating…" : "Run clearance"}
          </button>
        </div>
      </form>
      {error ? <p className="mt-3 text-sm tone-bad">{error}</p> : null}
      {result ? (
        <pre className="mono mt-4 overflow-x-auto rounded-xl bg-[var(--bg)] p-4 text-xs leading-relaxed text-[var(--muted)]">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
