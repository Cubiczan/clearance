import type { ChpState, ClearanceStatus } from "./types";

export interface ChpInput {
  action: string;
  amountCents: number;
  vendor?: string;
  agentName: string;
  policyMaxAuto: number;
  blocked: boolean;
  actionAllowed: boolean;
  withinSpendCap: boolean;
  memoryHints: string[];
}

export interface ChpResult {
  state: ChpState;
  status: ClearanceStatus;
  rationale: string;
  foundations: string[];
  attackFindings: string[];
  r0: {
    solvable: boolean;
    scoped: boolean;
    valid: boolean;
    worthIt: boolean;
  };
}

/**
 * Consensus Hardening Protocol gate for Clearance.
 * Lightweight production-shaped implementation of R0 + adversarial review + lock progression.
 */
export function runChpGate(input: ChpInput): ChpResult {
  const foundations = [
    "Agent identity and API key are authentic for this org",
    "Policy pack is current and signed into org config",
    input.memoryHints[0] ?? "No prior memory — default enterprise thresholds apply",
  ].slice(0, 3);

  const attackFindings: string[] = [];

  if (!input.actionAllowed) {
    attackFindings.push("Adversarial: action is outside the allowed action catalog");
  }
  if (input.blocked) {
    attackFindings.push("Adversarial: vendor appears on the blocked list");
  }
  if (!input.withinSpendCap) {
    attackFindings.push("Adversarial: agent spend cap would be exceeded");
  }
  if (input.amountCents > input.policyMaxAuto * 4) {
    attackFindings.push(
      "Adversarial: amount is >4× auto-approve threshold — elevated fraud surface",
    );
  }
  if (/ignore|override|jailbreak/i.test(input.action)) {
    attackFindings.push("Adversarial: prompt-injection markers in action string");
  }

  const r0 = {
    solvable: input.actionAllowed && !input.blocked,
    scoped: Boolean(input.vendor || input.action.includes(".")),
    valid: input.withinSpendCap && input.amountCents >= 0,
    worthIt: input.amountCents === 0 || input.amountCents <= input.policyMaxAuto * 10,
  };

  const r0Pass = r0.solvable && r0.scoped && r0.valid && r0.worthIt;

  if (!r0Pass || attackFindings.some((f) => f.includes("blocked") || f.includes("injection"))) {
    return {
      state: "REJECTED",
      status: "denied",
      rationale: `CHP denied for ${input.agentName}: R0 or hard adversarial failure.`,
      foundations,
      attackFindings,
      r0,
    };
  }

  if (!input.withinSpendCap) {
    return {
      state: "REJECTED",
      status: "denied",
      rationale: "Spend cap breached — clearance denied.",
      foundations,
      attackFindings,
      r0,
    };
  }

  if (input.amountCents > input.policyMaxAuto) {
    return {
      state: "PROVISIONAL",
      status: "pending_human",
      rationale: `Amount $${(input.amountCents / 100).toFixed(2)} exceeds auto-approve $${(input.policyMaxAuto / 100).toFixed(2)}. Escalating to human CHP review.`,
      foundations,
      attackFindings: [
        ...attackFindings,
        "Devil's advocate: large outbound value requires human lock before execution",
      ],
      r0,
    };
  }

  if (attackFindings.length > 0) {
    return {
      state: "PROVISIONAL_LOCK",
      status: "pending_human",
      rationale: "Soft adversarial findings present — human confirmation required.",
      foundations,
      attackFindings,
      r0,
    };
  }

  return {
    state: "LOCKED",
    status: "approved",
    rationale: `Auto-locked under policy for ${input.agentName}. Action is in-scope and under threshold.`,
    foundations,
    attackFindings: ["Devil's advocate: no material objections at routine tier"],
    r0,
  };
}

export function applyHumanDecision(
  decision: "approve" | "reject",
  notes?: string,
): { state: ChpState; status: ClearanceStatus; rationale: string } {
  if (decision === "approve") {
    return {
      state: "LOCKED",
      status: "approved",
      rationale: notes?.trim() || "Human validator locked clearance after CHP review.",
    };
  }
  return {
    state: "REJECTED",
    status: "denied",
    rationale: notes?.trim() || "Human validator rejected clearance.",
  };
}
