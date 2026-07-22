export type PlanId = "starter" | "pro" | "enterprise";
export type RiskTier = "routine" | "elevated" | "critical";
export type ClearanceStatus =
  | "approved"
  | "denied"
  | "pending_human"
  | "escalated";
export type ApprovalDecision = "approve" | "reject";
export type ChpState =
  | "EXPLORING"
  | "PROVISIONAL"
  | "PROVISIONAL_LOCK"
  | "LOCKED"
  | "REJECTED";

export interface Org {
  id: string;
  name: string;
  plan: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  clearanceQuota: number;
  clearanceUsed: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  orgId: string;
  name: string;
  description: string;
  riskTier: RiskTierAllowed;
  spendCapCents: number;
  spendUsedCents: number;
  allowlist: string[];
  apiKeyHash: string;
  apiKeyPreview: string;
  memoryNamespace: string;
  active: boolean;
  createdAt: string;
}

export type RiskTierAllowed = RiskTier[];

export interface PolicyPack {
  id: string;
  orgId: string;
  name: string;
  maxAutoApproveCents: number;
  requireHumanAboveCents: number;
  blockedVendors: string[];
  allowedActions: string[];
}

export interface ClearanceRequest {
  id: string;
  orgId: string;
  agentId: string;
  action: string;
  amountCents: number;
  currency: string;
  vendor?: string;
  context: Record<string, unknown>;
  status: ClearanceStatus;
  chpState: ChpState;
  rationale: string;
  foundations: string[];
  attackFindings: string[];
  memoryHits: string[];
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface ApprovalItem {
  id: string;
  clearanceId: string;
  orgId: string;
  agentId: string;
  summary: string;
  amountCents: number;
  status: "open" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditRecord {
  id: string;
  orgId: string;
  event: string;
  actor: string;
  inputs: Record<string, unknown>;
  sources: string[];
  confidence?: string;
  rationale?: string;
  prevSig: string;
  sig: string;
  ts: string;
}

export interface UsageEvent {
  id: string;
  orgId: string;
  agentId: string;
  clearanceId: string;
  units: number;
  amountCents: number;
  ts: string;
}

export interface MemoryDoc {
  id: string;
  namespace: string;
  text: string;
  tags: string[];
  createdAt: string;
}

export interface StoreShape {
  org: Org;
  agents: Agent[];
  policies: PolicyPack[];
  clearances: ClearanceRequest[];
  approvals: ApprovalItem[];
  audit: AuditRecord[];
  usage: UsageEvent[];
  memory: MemoryDoc[];
  demoApiKey: string;
}
