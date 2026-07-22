import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-16 pt-6">
        <header className="flex items-center justify-between py-4">
          <div className="display text-2xl font-semibold">Clearance</div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn btn-ghost text-sm">
              Open console
            </Link>
            <Link href="/billing" className="btn btn-primary text-sm">
              Start free demo
            </Link>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col justify-center py-16 md:py-24">
          <div className="absolute inset-x-0 top-10 -z-10 h-[420px] rounded-[40px] bg-[radial-gradient(circle_at_30%_20%,rgba(200,245,66,0.14),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(90,150,190,0.18),transparent_40%)]" />
          <p className="pill w-fit animate-rise">
            <span className="live-dot" /> Galuxium Nexus V2 · production SaaS
          </p>
          <h1 className="display mt-6 max-w-4xl animate-rise text-5xl font-semibold leading-[1.05] md:text-7xl">
            Clearance
          </h1>
          <p className="mt-5 max-w-xl animate-rise-delay text-lg text-[var(--muted)] md:text-xl">
            The approval, spend-control, and billing layer for production AI agents.
            Every high-impact action hits policy, CHP lock, and a signed audit ledger.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-rise-delay">
            <Link href="/dashboard" className="btn btn-primary">
              Launch control plane
            </Link>
            <Link href="/api/audit?format=jsonl" className="btn btn-ghost">
              Export audit ledger
            </Link>
          </div>
        </section>

        <section className="grid gap-6 border-t border-[var(--line)] pt-12 md:grid-cols-3">
          {[
            {
              title: "Gate before spend",
              body: "Agents call POST /v1/clearance. Caps, allowlists, and blocked vendors decide auto-lock vs human review.",
            },
            {
              title: "CHP governance",
              body: "R0 checks, adversarial findings, and lock progression — the same governance DNA as Cubiczan finance agents.",
            },
            {
              title: "Billable by design",
              body: "Seat plans plus metered clearances with Stripe Checkout and webhook provisioning — not a pricing slide.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="display text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-[var(--muted)]">{item.body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
