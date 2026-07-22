import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateClearance } from "@/lib/clearance";
import { loadStore, verifyApiKey } from "@/lib/store";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.string().min(1),
  amountCents: z.number().int().min(0).optional(),
  currency: z.string().optional(),
  vendor: z.string().optional(),
  context: z.record(z.string(), z.unknown()).optional(),
  agentId: z.string().optional(),
});

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let agent = verifyApiKey(apiKey);

  // Demo convenience: allow dashboard calls without key when agentId provided
  if (!agent) {
    const json = await req.clone().json().catch(() => null);
    const store = loadStore();
    if (json?.agentId) {
      agent = store.agents.find((a) => a.id === json.agentId && a.active) ?? null;
    }
    if (!agent && process.env.CLEARANCE_ALLOW_DEMO !== "false") {
      agent = store.agents[0] ?? null;
    }
  }

  if (!agent) {
    return NextResponse.json({ error: "Unauthorized — provide x-api-key" }, { status: 401 });
  }

  const raw = await req.json();
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const clearance = evaluateClearance(agent, parsed.data);
  return NextResponse.json({
    clearance,
    decision: clearance.status,
    chpState: clearance.chpState,
    message: clearance.rationale,
  });
}

export async function GET() {
  const store = loadStore();
  return NextResponse.json({
    clearances: store.clearances.slice(0, 50),
    demoApiKey: store.demoApiKey,
  });
}
