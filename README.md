# Clearance

**The approval, spend-control, and billing layer for production AI agents.**

Galuxium Nexus V2 submission — a production-shaped SaaS control plane where every high-impact agent action must pass policy + CHP governance before spend executes, with Stripe monetization and a tamper-evident audit ledger.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Market friction

Companies are shipping AI agents into support, sales, research, and finance — but finance still has no control plane. Spend is opaque, approvals live in Slack folklore, and audit trails die in chat logs.

**Clearance** is the gate: agents call one API before any paid or high-risk action. Policy packs decide auto-lock vs human review. Every decision is signed into an append-only ledger. Seats and clearances are billed through Stripe.

## Who it's for

VP Engineering + Finance Ops at mid-market companies running 10+ production agents.

## Core workflow

```text
Agent → POST /api/v1/clearance
     → Policy pack (caps, allowlists, blocked vendors)
     → CHP gate (R0 + adversarial review)
     → Memory retrieval (demo RAG / Backboard-ready)
     → Approve | Deny | Escalate to human
     → Usage meter event
     → HMAC-chained audit ledger
```

## Quick start

```bash
bun install
cp .env.example .env
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

Zero external credentials required. Demo org, agents, and policies seed automatically into `data/clearance-store.json`.

### Demo script (2 minutes)

1. Open **Dashboard** → Request clearance for `payment.transfer` / `stripe.com` / `$180` → auto-**LOCKED**.
2. Repeat with `$600` → status `pending_human` → appear in **Approvals**.
3. Approve → spend meter updates → **Audit** shows chained signatures.
4. Try vendor `darkweb-market` → **DENIED**.
5. **Billing** → choose a plan (demo mode updates locally; set Stripe keys for live Checkout).

Demo API key (Research Scout): `clr_live_demo_key_nexus_v2`

```bash
curl -X POST http://localhost:3000/api/v1/clearance \
  -H "Content-Type: application/json" \
  -H "x-api-key: clr_live_demo_key_nexus_v2" \
  -d '{"action":"research.query","vendor":"sec.gov","amountCents":1200}'
```

## Fiscal architecture

| Plan | Price | Includes |
|------|-------|----------|
| Starter | $49/mo | 3 agents, 2k clearances, email HITL, ledger export |
| Pro | $199/mo | 25 agents, 25k clearances, usage overage |
| Enterprise | Custom | SSO, audit API, dedicated memory namespace |

Live path: Stripe Checkout Sessions + webhook provisioning (`/api/stripe/webhook`). Without `STRIPE_SECRET_KEY`, billing runs in **demo mode** and updates the local plan.

## Architecture

| Layer | Implementation |
|-------|----------------|
| UI | Next.js 15 App Router, Manrope + Fraunces, server-rendered console |
| API | Route handlers under `/api/*` |
| Governance | CHP R0 + adversarial findings + lock progression (`src/lib/chp.ts`) |
| Memory | Namespace retrieval; Backboard-ready via `BACKBOARD_API_KEY` |
| Persistence | JSON store at `data/clearance-store.json` (swap for Postgres in prod) |
| Audit | HMAC-SHA256 signature-chained JSONL export |
| Payments | Stripe Checkout + webhooks |

```
src/
  app/                  # Landing + console pages + API routes
  components/           # Shell, playground, approvals, billing
  lib/                  # store, chp, clearance, memory, stripe, types
docs/                   # Executive brief + fiscal blueprint
```

## Environment

See [`.env.example`](.env.example).

| Variable | Purpose |
|----------|---------|
| `CLEARANCE_AUDIT_KEY` | HMAC key for audit ledger |
| `CLEARANCE_DEMO_API_KEY` | Seed API key for Research Scout |
| `STRIPE_SECRET_KEY` | Enables live Checkout |
| `STRIPE_WEBHOOK_SECRET` | Verifies subscription webhooks |
| `BACKBOARD_API_KEY` | Optional production memory/RAG |

## API surface

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/clearance` | Evaluate clearance (requires `x-api-key`) |
| `GET` | `/api/v1/clearance` | Recent clearances |
| `GET/POST` | `/api/agents` | List / register agents |
| `GET/POST` | `/api/approvals` | HITL queue + resolve |
| `GET` | `/api/audit` | Ledger JSON (`?format=jsonl` to download) |
| `GET` | `/api/usage` | Dashboard aggregate |
| `POST` | `/api/stripe/checkout` | Start subscription Checkout |
| `POST` | `/api/stripe/webhook` | Provision plan from Stripe |
| `POST` | `/api/demo` | Reset store / set plan |

## Nexus V2 submission checklist

- [x] Production-ready app (run locally or deploy to Vercel/Fly/Railway)
- [x] Public GitHub + Codeberg repositories with architecture README
- [x] Operational MVP: clearance → CHP → HITL → meter → audit
- [x] Executive brief: [`docs/EXECUTIVE_BRIEF.md`](docs/EXECUTIVE_BRIEF.md)
- [x] Fiscal architecture: [`docs/FISCAL_ARCHITECTURE.md`](docs/FISCAL_ARCHITECTURE.md)
- [ ] Demo video (2–5 min) — record against the live demo script above
- [ ] Deployed public URL — attach after hosting

## Deploy

```bash
# Vercel
bunx vercel

# Docker
docker build -t clearance .
docker run -p 3000:3000 -e CLEARANCE_AUDIT_KEY=change-me clearance
```

For durable multi-instance production, replace the JSON store with Postgres/Turso and put `data/` on a volume only for single-node demos.

## Repositories

| Remote | URL |
|--------|-----|
| GitHub (ops) | https://github.com/icohangar-ops/clearance |
| GitHub (Cubiczan) | https://github.com/Cubiczan/clearance |
| Codeberg | https://codeberg.org/cubiczan/clearance |

## Cubiczan stack lineage

Clearance productizes patterns from:

- [consensus-hardening-protocol](https://github.com/icohangar-ops/consensus-hardening-protocol) — CHP locks
- [cleanmandate](https://github.com/icohangar-ops/cleanmandate) — payment mandates
- [agent-observability](https://github.com/icohangar-ops/agent-observability) — spend visibility
- [meshcfo](https://github.com/icohangar-ops/meshcfo) — auditable finance agents
- [Live-Diligence](https://github.com/icohangar-ops/Live-Diligence) — Stripe subscription patterns

## License

MIT © Cubiczan / Shyam Desigan
