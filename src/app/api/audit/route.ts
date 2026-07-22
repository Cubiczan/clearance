import { NextResponse } from "next/server";
import { loadStore, verifyAuditChain } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const store = loadStore();
  const { searchParams } = new URL(req.url);
  const format = searchParams.get("format") || "json";
  const chain = verifyAuditChain(store);

  if (format === "jsonl") {
    const body = store.audit.map((row) => JSON.stringify(row)).join("\n");
    return new NextResponse(body + (body ? "\n" : ""), {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Content-Disposition": 'attachment; filename="clearance-audit.jsonl"',
        "X-Audit-Intact": String(chain.intact),
      },
    });
  }

  return NextResponse.json({
    audit: store.audit,
    chain,
    count: store.audit.length,
  });
}
