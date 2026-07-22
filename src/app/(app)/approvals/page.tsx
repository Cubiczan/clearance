import { AppShell } from "@/components/AppShell";
import { ApprovalActions } from "@/components/ApprovalActions";
import { money, statusTone } from "@/lib/format";
import { loadStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function ApprovalsPage() {
  const store = loadStore();
  const open = store.approvals.filter((a) => a.status === "open");
  const closed = store.approvals.filter((a) => a.status !== "open");

  return (
    <AppShell
      title="Approvals"
      subtitle="Human-in-the-loop CHP review for clearances above policy thresholds."
    >
      <div className="grid gap-4">
        {open.length === 0 ? (
          <div className="panel p-6 text-[var(--muted)]">
            No open approvals. Request a payment over $250 from the dashboard to enqueue one.
          </div>
        ) : (
          open.map((a) => {
            const clearance = store.clearances.find((c) => c.id === a.clearanceId);
            return (
              <div key={a.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="display text-xl font-semibold">{a.summary}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {money(a.amountCents)} · {a.id}
                    </p>
                    {clearance ? (
                      <div className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
                        <p>{clearance.rationale}</p>
                        <p className="mt-2">
                          CHP state:{" "}
                          <span className={`tone-${statusTone(clearance.chpState)}`}>
                            {clearance.chpState}
                          </span>
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <ApprovalActions approvalId={a.id} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {closed.length > 0 ? (
        <div className="mt-8">
          <h2 className="display mb-3 text-xl font-semibold">Resolved</h2>
          <div className="panel overflow-x-auto p-2">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Summary</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {closed.map((a) => (
                  <tr key={a.id}>
                    <td>{a.summary}</td>
                    <td className={`tone-${statusTone(a.status)}`}>{a.status}</td>
                    <td className="text-[var(--muted)]">{a.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
