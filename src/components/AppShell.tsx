import Link from "next/link";

const NAV = [
  { href: "/dashboard", label: "Overview" },
  { href: "/agents", label: "Agents" },
  { href: "/approvals", label: "Approvals" },
  { href: "/spend", label: "Spend" },
  { href: "/audit", label: "Audit" },
  { href: "/billing", label: "Billing" },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="display text-xl font-semibold tracking-tight">
            Clearance
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link href="/approvals" className="btn btn-primary text-sm">
            Review queue
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 animate-rise">
          <h1 className="display text-3xl font-semibold md:text-4xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div className="animate-rise-delay">{children}</div>
      </main>
    </div>
  );
}
