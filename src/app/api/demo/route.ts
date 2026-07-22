import { NextResponse } from "next/server";
import { z } from "zod";
import { mutateStore, resetStore } from "@/lib/store";
import { PLAN_CATALOG } from "@/lib/stripe";
import type { PlanId } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (body?.action === "reset") {
    const store = resetStore();
    return NextResponse.json({ ok: true, org: store.org, agents: store.agents.length });
  }

  const schema = z.object({
    action: z.literal("set_plan"),
    plan: z.enum(["starter", "pro", "enterprise"]),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Use { action: 'reset' } or { action: 'set_plan', plan }" },
      { status: 400 },
    );
  }

  const org = mutateStore((store) => {
    const plan = parsed.data.plan as PlanId;
    store.org.plan = plan;
    store.org.clearanceQuota = PLAN_CATALOG[plan].quota;
    return store.org;
  });

  return NextResponse.json({ ok: true, org });
}
