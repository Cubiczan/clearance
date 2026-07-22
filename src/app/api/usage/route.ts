import { NextResponse } from "next/server";
import { dashboardStats } from "@/lib/clearance";
import { backboardConfig } from "@/lib/memory";
import { loadStore, verifyAuditChain } from "@/lib/store";
import { PLAN_CATALOG, stripeMode } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const store = loadStore();
  return NextResponse.json({
    org: store.org,
    stats: dashboardStats(store),
    plan: PLAN_CATALOG[store.org.plan],
    stripeMode: stripeMode(),
    backboard: backboardConfig(),
    auditChain: verifyAuditChain(store),
    recentClearances: store.clearances.slice(0, 8),
    openApprovals: store.approvals.filter((a) => a.status === "open").slice(0, 8),
    usage: store.usage.slice(0, 20),
    agents: store.agents,
  });
}
