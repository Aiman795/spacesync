"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-ink font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">S</div>
            <span className="font-display text-sm font-semibold tracking-tight">SpaceSync</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-ink hover:text-muted transition-colors">
              Sign in
            </Link>
            <Link
              href="/calendar"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              Open calendar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:pt-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Now tracking conflict-free bookings
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-6xl">
              Every room, desk, and resource — booked without the back-and-forth.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              SpaceSync checks availability, blocks scheduling conflicts before they happen, and tells the right people when a booking changes. No spreadsheets, no double-bookings.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/calendar"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-7 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
              >
                View calendar
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-semibold text-ink hover:bg-paper transition-colors"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted">Free for teams getting started. No credit card required.</p>
          </div>

          {/* Signature element: live schedule strip */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-muted">CONFERENCE ROOM A · TODAY</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Live
              </span>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-border bg-background">
              <div className="grid grid-cols-6 divide-x divide-border text-[10px] font-mono text-muted">
                {["8a", "10a", "12p", "2p", "4p", "6p"].map((t) => (
                  <div key={t} className="px-2 py-1.5">{t}</div>
                ))}
              </div>
              <div className="relative h-24 border-t border-border">
                <div className="absolute left-[6%] top-3 h-7 w-[20%] rounded-md bg-primary/90 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                  Standup
                </div>
                <div className="absolute left-[40%] top-3 h-7 w-[16%] rounded-md bg-ink/80 px-2 py-1 text-[10px] font-semibold text-white shadow-sm">
                  Sync
                </div>
                <div className="absolute left-[68%] top-14 h-7 w-[24%] rounded-md border-2 border-dashed border-primary/50 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                  Open
                </div>
                <div className="now-line absolute top-0 h-full w-px bg-coral">
                  <div className="absolute -top-1 -left-1 h-2 w-2 rounded-full bg-coral" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              SpaceSync watches every room in real time and flags the next open window automatically.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Built for teams that share space</h2>
            <p className="mt-3 text-muted">Three problems every shared calendar eventually runs into — solved by default.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Conflict detection",
                body: "Overlapping bookings — including buffer time between meetings — are rejected before they're ever saved.",
              },
              {
                title: "Automatic notifications",
                body: "Confirmations and reminders go out on their own, so no one shows up to a room that isn't ready for them.",
              },
              {
                title: "Built-in check-in",
                body: "Unclaimed bookings release automatically, so a forgotten reservation doesn't block a room all day.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 h-9 w-9 rounded-lg bg-primary/10" />
                <h3 className="font-display text-base font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — genuinely sequential, so numbering earns its place here */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold tracking-tight text-ink">Three steps to a booked room</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { step: "01", title: "Pick a space", body: "Browse rooms and resources by capacity, location, or equipment." },
            { step: "02", title: "Choose a time", body: "Available slots are the only ones you can select — conflicts are ruled out automatically." },
            { step: "03", title: "Get confirmed", body: "You and your attendees get a confirmation email the moment it's booked." },
          ].map((s) => (
            <div key={s.step}>
              <span className="font-mono text-sm font-semibold text-primary">{s.step}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Stop booking rooms over email.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted">Set up your first space in under five minutes.</p>
          <Link
            href="/calendar"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
          >
            Get started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">S</div>
                <span className="font-display text-sm font-semibold text-ink">SpaceSync</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                The scheduling layer for shared spaces — rooms, desks, and equipment, booked without the friction.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Product</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link href="/calendar" className="text-ink hover:text-primary transition-colors">Calendar</Link></li>
                <li><a href="#features" className="text-ink hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="text-ink hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Company</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="text-ink hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="text-ink hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-ink hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Legal</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="#" className="text-ink hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="text-ink hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
         
        </div>
      </footer>

      <style jsx>{`
        .now-line {
          left: 46%;
          animation: sweep 8s ease-in-out infinite alternate;
        }
        @keyframes sweep {
          from { left: 20%; }
          to { left: 78%; }
        }
      `}</style>
    </div>
  );
}