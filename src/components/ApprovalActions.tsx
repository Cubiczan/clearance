"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApprovalActions({
  approvalId,
}: {
  approvalId: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  async function decide(decision: "approve" | "reject") {
    setBusy(true);
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvalId, decision, notes }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <textarea
        className="textarea"
        placeholder="Decision notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          className="btn btn-ok text-sm"
          disabled={busy}
          onClick={() => decide("approve")}
          type="button"
        >
          Lock approve
        </button>
        <button
          className="btn btn-danger text-sm"
          disabled={busy}
          onClick={() => decide("reject")}
          type="button"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
