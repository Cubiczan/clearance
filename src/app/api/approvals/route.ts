import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveApproval } from "@/lib/clearance";
import { loadStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = loadStore();
  return NextResponse.json({ approvals: store.approvals });
}

const bodySchema = z.object({
  approvalId: z.string(),
  decision: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const result = resolveApproval(
      parsed.data.approvalId,
      parsed.data.decision,
      parsed.data.notes,
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 400 },
    );
  }
}
