# Executive Brief — Clearance

## Market friction

Mid-market and enterprise teams are deploying AI agents across support, sales, research, and finance operations. Engineering can ship agents in days; finance cannot answer basic control questions:

- Which agent spent what, under whose policy?
- Which actions were auto-approved vs human-locked?
- Can we prove the decision trail to an auditor?

Today the answers live in Slack threads, vendor dashboards, and tribal knowledge. That gap is the product.

## Solution

**Clearance** is a SaaS control plane for production AI agents. Before an agent executes a high-impact action (payment, refund, outbound tool call), it requests clearance:

1. **Policy pack** — spend caps, allowlists, blocked vendors, allowed actions  
2. **CHP gate** — R0 solvability checks + adversarial review + lock progression  
3. **Memory** — prior decisions and org policy retrieved into the evaluation  
4. **Human queue** — amounts above threshold require explicit lock  
5. **Meter + bill** — approved clearances become usage events; seats via Stripe  
6. **Audit export** — HMAC-chained ledger for finance and compliance  

## Architecture (high level)

- **Next.js** application with server-rendered console and Node route handlers  
- **Clearance API** (`POST /api/v1/clearance`) as the single chokepoint for agent actions  
- **CHP module** encoding Cubiczan Consensus Hardening Protocol semantics  
- **Signed audit ledger** with per-record signature chaining  
- **Stripe Checkout + webhooks** for plan provisioning  
- **Backboard-ready memory interface** for production RAG / persistent agent memory  

Security posture: API keys hashed at rest, timing-safe comparisons, webhook signature verification, env-based secrets, append-only audit trail.

## Target cohort

Primary: VP Engineering + Finance Ops / Controller at 50–2,000 employee companies running multiple production agents.

Secondary: AI platform teams inside PE-backed SaaS firms that need customer-facing agent spend controls.

## Why now

Agent frameworks proliferated; control planes did not. Nexus V2 judges for production infrastructure and monetization — Clearance is designed as billable software, not a demo agent.
