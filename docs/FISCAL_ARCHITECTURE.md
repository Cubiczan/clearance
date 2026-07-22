# Fiscal Architecture — Clearance

## Revenue model

Clearance captures value through **tiered SaaS subscriptions** plus **usage-based metering** on clearance evaluations.

### Subscription tiers

| Tier | Price | Agents | Monthly clearance quota | Notes |
|------|-------|--------|-------------------------|-------|
| Starter | $49/mo | 3 | 2,000 | SMB teams proving the control loop |
| Pro | $199/mo | 25 | 25,000 | Default commercial tier |
| Enterprise | Custom | Unlimited* | Custom | SSO, audit API, dedicated memory, MSA |

\*Contractual fair-use limits apply.

### Usage metering

- Each evaluated clearance consumes **1 unit** of quota.  
- Overage on Pro: billed per 1,000 clearances (list: $15 / 1k — configure as Stripe metered item in production).  
- Approved clearances also emit internal spend events for customer chargeback / cost-center reporting (not platform revenue).

### Payment infrastructure

| Component | Status |
|-----------|--------|
| Stripe Checkout Sessions | Implemented (`/api/stripe/checkout`) |
| Webhook provisioning | Implemented (`/api/stripe/webhook`) |
| Demo fallback | Plan mutates locally when Stripe keys absent |
| Customer portal | Roadmap (Enterprise) |

## Unit economics (indicative)

- Gross margin target: >80% at Pro (software + inference/memory COGS)  
- Primary COGS: LLM/memory hosting (Backboard), Stripe fees (~2.9%+$0.30), hosting  
- Expansion: seat growth + clearance volume + Enterprise policy packs  

## Go-to-market loop

1. Engineer integrates `POST /v1/clearance` in one afternoon  
2. Finance sees spend + audit in the console  
3. Upgrade triggered when open approvals and quota pressure appear  

## Seed-fund readiness

- Live payment path with webhook handling  
- Agentic workflow with persistent memory interface  
- Signed audit + policy gates for governance scoring  
