import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fallbackLandingOverview,
  getLandingOverview,
  type LandingOverview,
} from "@/lib/data/clinic-operations";

export function LandingPage() {
  const [overview, setOverview] = useState<LandingOverview>(fallbackLandingOverview);

  useEffect(() => {
    let mounted = true;

    void getLandingOverview().then((result) => {
      if (mounted) {
        setOverview(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const modules = [
    "Patient registration with MyKad-ready fields",
    "Appointments, queue board, and doctor assignment",
    "Consultation notes with assessment and treatment plan",
    "Billing review, receipts, and manual payment verification",
    "Inventory tracking with reorder thresholds",
    "Tenant admin controls with audit history",
  ];

  const readinessTone = {
    good: "border-[#d6e7e4] bg-[var(--brand-soft)] text-[#21473f]",
    warn: "border-[#efe2c9] bg-[#faf4e7] text-[#5b4620]",
    danger: "border-[#efd8d2] bg-[#fff4f1] text-[#6a342a]",
  } as const;

  return (
    <div className="app-shell min-h-screen px-4 py-8 text-foreground md:px-10 md:py-12">
      <main className="mx-auto w-full max-w-6xl space-y-8">
        <header className="reveal rounded-3xl border border-(--line) bg-(--surface) p-6 shadow-[0_22px_80px_rgba(17,40,31,0.08)] md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--brand)">
                PulseDesk Clinic Cloud
              </p>
              <h1 className="display-font mt-3 max-w-2xl text-3xl leading-tight text-[#102218] md:text-5xl">
                A real clinic operating system for Malaysian practices, not a brochure.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[#3f4f46] md:text-base">
                Built around the actual Phase 1 plan: registration, appointments, consultation notes, billing controls, inventory, and multi-tenant admin oversight.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/clinic/dashboard"
                  className="rounded-2xl bg-(--brand) px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Open Clinic Workspace
                </Link>
                <Link
                  to="/admin"
                  className="rounded-2xl border border-(--line) bg-(--surface-muted) px-5 py-3 text-sm font-semibold text-[#1b342a] transition hover:bg-[#e2e9e0]"
                >
                  Open Admin Control
                </Link>
              </div>
            </div>

            <article className="rounded-3xl border border-(--line) bg-(--surface-muted) p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-[#5f7b6e]">
                Platform Readiness
              </p>
              <div className="mt-4 space-y-3">
                {overview.readiness.map((item) => (
                  <div key={item.title} className={`rounded-2xl border px-4 py-3 text-sm ${readinessTone[item.tone]}`}>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 opacity-90">{item.detail}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#56695f]">
                Professional launch state means clean UI plus working modules and predictable admin controls.
              </p>
            </article>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {overview.stats.map((item, index) => (
            <article
              key={item.label}
              className={`reveal delay-${index + 1} rounded-2xl border border-(--line) bg-(--surface) p-5`}
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[#648372]">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#143326]">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-[#4f6257]">{item.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="reveal rounded-3xl border border-(--line) bg-(--surface) p-6 delay-2 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="display-font text-2xl text-[#1a3126] md:text-3xl">
                  Core Modules
                </h2>
                <p className="mt-2 text-sm text-[#4e5e55] md:text-base">
                  These are the modules that make the platform sellable to real clinics.
                </p>
              </div>
              <Link to="/clinic/setup" className="text-sm font-semibold text-(--brand)">
                Configure clinic
              </Link>
            </div>
            <ul className="mt-6 grid gap-3 text-sm md:grid-cols-2 md:text-base">
              {modules.map((module) => (
                <li
                  key={module}
                  className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3"
                >
                  {module}
                </li>
              ))}
            </ul>
          </article>

          <article className="reveal delay-3 rounded-3xl border border-(--line) bg-(--surface) p-6 md:p-8">
            <h2 className="display-font text-2xl text-[#1a3126] md:text-3xl">
              Operations Snapshot
            </h2>
            <div className="mt-5 space-y-3">
              {overview.operations.map((item) => (
                <div key={item.title} className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm text-[#21473f]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.14em] text-[#557065]">{item.value}</span>
                  </div>
                  <p className="mt-2 text-[#44574e]">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-(--line) p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#688276]">
                Commercial Positioning
              </p>
              <p className="mt-2 text-sm text-[#42534a]">
                Sell this as a cloud clinic operating system with faster registration, cleaner doctor workflow, stronger billing control, and central tenant management.
              </p>
            </div>
          </article>
        </section>

        <footer className="reveal rounded-2xl border border-(--line) bg-(--surface) p-4 text-sm text-[#4f6057] delay-3 md:p-5">
          Built to feel premium on desktop and mobile while reflecting the actual MVP plan instead of placeholder marketing copy.
        </footer>
      </main>
    </div>
  );
}