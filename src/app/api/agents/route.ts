import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAgentApiKey,
  hashApiKey,
  loadStore,
  mutateStore,
  newId,
  previewApiKey,
} from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  const store = loadStore();
  return NextResponse.json({
    agents: store.agents,
    demoApiKey: store.demoApiKey,
  });
}

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  spendCapCents: z.number().int().positive().default(50000),
  allowlist: z.array(z.string()).default([]),
  riskTier: z
    .array(z.enum(["routine", "elevated", "critical"]))
    .default(["routine", "elevated"]),
});

export async function POST(req: Request) {
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const apiKey = createAgentApiKey();
  const agent = mutateStore((store) => {
    const created = {
      id: newId("agt"),
      orgId: store.org.id,
      name: parsed.data.name,
      description: parsed.data.description,
      riskTier: parsed.data.riskTier,
      spendCapCents: parsed.data.spendCapCents,
      spendUsedCents: 0,
      allowlist: parsed.data.allowlist,
      apiKeyHash: hashApiKey(apiKey),
      apiKeyPreview: previewApiKey(apiKey),
      memoryNamespace: `${store.org.id}/${parsed.data.name.toLowerCase().replace(/\s+/g, "-")}`,
      active: true,
      createdAt: new Date().toISOString(),
    };
    store.agents.push(created);
    return created;
  });

  return NextResponse.json({ agent, apiKey }, { status: 201 });
}
