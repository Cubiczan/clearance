import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { statusTone } from "@/lib/format";
import { loadStore, verifyAuditChain } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function AuditPage() {
  const store = loadStore();
  const chain = verifyAuditChain(store);

  return (
    <AppShell
      title="Audit ledger"
      subtitle="Tamper-evident, signature-chained records for every clearance decision."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="panel px-4 py-3">
          Chain:{" "}
          <span className={`font-semibold tone-${statusTone(chain.intact ? "intact" : "denied")}`}>
            {chain.intact ? "intact" : "broken"}
          </span>
        </div>
        <Link href="/api/audit?format=jsonl" className="btn btn-ghost text-sm">
          Download JSONL
        </Link>
      </div>

      <div className="panel overflow-x-auto p-2">
        <table className="table text-sm">
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Actor</th>
              <th>Rationale</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            {[...store.audit].reverse().map((row) => (
              <tr key={row.id}>
                <td className="mono text-xs">{new Date(row.ts).toLocaleString()}</td>
                <td>{row.event}</td>
                <td className="mono text-xs">{row.actor}</td>
                <td className="max-w-md text-[var(--muted)]">{row.rationale || "—"}</td>
                <td className="mono text-xs text-[var(--muted)]">{row.sig.slice(0, 16)}…</td>
              </tr>
            ))}
            {store.audit.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-[var(--muted)]">
                  Ledger empty — evaluate a clearance to append the first record.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
