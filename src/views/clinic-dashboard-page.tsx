import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { clinicNavigation } from "@/lib/navigation";
import {
  getClinicDashboardData,
  fallbackClinicDashboardData,
  type ClinicDashboardData,
  type DashboardStat,
  type RecentInvoice,
} from "@/lib/data/dashboard";
import { logoutClinic } from "@/lib/data/onboarding";

const STAT_STYLES: Record<string, { bg: string; border: string; bar: string; text: string }> = {
  green:  { bg: "bg-[#f0fdf6]",  border: "border-[#bbf7d0]", bar: "bg-[#1D9E75]", text: "text-[#166534]" },
  blue:   { bg: "bg-[#eff6ff]",  border: "border-[#bfdbfe]", bar: "bg-[#3b82f6]", text: "text-[#1e40af]" },
  amber:  { bg: "bg-[#fffbeb]",  border: "border-[#fde68a]", bar: "bg-[#f59e0b]", text: "text-[#92400e]" },
  red:    { bg: "bg-[#fff1f2]",  border: "border-[#fecdd3]", bar: "bg-[#ef4444]", text: "text-[#991b1b]" },
};

const STATUS_STYLES: Record<RecentInvoice["status"], { pill: string; dot: string }> = {
  paid:    { pill: "bg-[#dcfce7] text-[#166534]", dot: "bg-[#22c55e]" },
  pending: { pill: "bg-[#fef9c3] text-[#854d0e]", dot: "bg-[#eab308]" },
  overdue: { pill: "bg-[#fee2e2] text-[#991b1b]", dot: "bg-[#ef4444]" },
};

const QUEUE_STATUS_STYLES: Record<string, string> = {
  "In consultation": "bg-[#dcfce7] text-[#166534]",
  "Waiting":         "bg-[#fef9c3] text-[#854d0e]",
};

function TrendArrow({ trend }: { trend?: DashboardStat["trend"] }) {
  if (trend === "up")   return <span className="text-[#16a34a] text-xs font-semibold">▲</span>;
  if (trend === "down") return <span className="text-[#dc2626] text-xs font-semibold">▼</span>;
  return null;
}

function StatCard({ stat }: { stat: DashboardStat }) {
  const s = STAT_STYLES[stat.color ?? "green"];
  return (
    <article className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${s.text}`}>
        {stat.label}
      </p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${s.text}`}>
        {stat.value}
      </p>
      <p className="mt-2 flex items-center gap-1 text-xs text-[#4d6056]">
        <TrendArrow trend={stat.trend} />
        {stat.note}
      </p>
    </article>
  );
}

export function ClinicDashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<ClinicDashboardData>(fallbackClinicDashboardData);

  useEffect(() => {
    let mounted = true;
    void getClinicDashboardData().then((result) => {
      if (mounted) setData(result);
    });
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    await logoutClinic();
    navigate("/login");
  }

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const paidCount   = data.recentInvoices.filter((i) => i.status === "paid").length;
  const pendingCount = data.recentInvoices.filter((i) => i.status === "pending").length;
  const overdueCount = data.recentInvoices.filter((i) => i.status === "overdue").length;

  return (
    <WorkspaceLayout
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      onLogout={() => void handleLogout()}
    >
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
            Dashboard
          </p>
          <h1 className="display-font mt-1 text-3xl text-[#1b3027]">
            Clinic Overview
          </h1>
        </div>
        <p className="text-sm text-[#6c857a]">{today}</p>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      {/* ── Middle row: Invoice summary + Queue ─────────────────── */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Invoice status breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Invoice Status
          </p>
          <h2 className="display-font mt-1 text-xl text-[#1b3027]">Billing Summary</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: "Paid",    count: paidCount,    total: data.recentInvoices.length, color: "bg-[#22c55e]" },
              { label: "Pending", count: pendingCount, total: data.recentInvoices.length, color: "bg-[#eab308]" },
              { label: "Overdue", count: overdueCount, total: data.recentInvoices.length, color: "bg-[#ef4444]" },
            ].map(({ label, count, total, color }) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs text-[#4d6056]">
                    <span className="font-medium">{label}</span>
                    <span>{count} / {total}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#eeeee9]">
                    <div
                      className={`h-2 rounded-full ${color} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-4">
            {[
              { label: "Paid",    count: paidCount,    badge: "bg-[#dcfce7] text-[#166534]" },
              { label: "Pending", count: pendingCount, badge: "bg-[#fef9c3] text-[#854d0e]" },
              { label: "Overdue", count: overdueCount, badge: "bg-[#fee2e2] text-[#991b1b]" },
            ].map(({ label, count, badge }) => (
              <div key={label} className="text-center">
                <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>
                  {label}
                </span>
                <p className="mt-1 text-2xl font-bold text-[#1b3027]">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Queue */}
        <div className="lg:col-span-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                Live Queue
              </p>
              <h2 className="display-font mt-1 text-xl text-[#1b3027]">Today's Patients</h2>
            </div>
            <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-xs font-semibold text-[#166534]">
              {data.queue.filter((q) => q.status === "Waiting").length} waiting
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                  <th className="pb-3 pr-4">No.</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Doctor</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.queue.map((row) => {
                  const badge = QUEUE_STATUS_STYLES[row.status] ?? "bg-[#f1f5f9] text-[#475569]";
                  return (
                    <tr key={row.number} className="border-t border-[var(--line)]">
                      <td className="py-3 pr-4 font-mono text-xs font-bold text-[#1D9E75]">{row.number}</td>
                      <td className="py-3 pr-4 font-medium text-[#19382b]">{row.patient}</td>
                      <td className="py-3 pr-4 text-[#33473d]">{row.doctor}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Recent Invoices ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Billing
            </p>
            <h2 className="display-font mt-1 text-xl text-[#1b3027]">Recent Invoices</h2>
          </div>
          <span className="text-xs text-[#6c857a]">Last 5 invoices</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                <th className="pb-3 pr-4">Invoice</th>
                <th className="pb-3 pr-4">Patient</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentInvoices.map((inv) => {
                const s = STATUS_STYLES[inv.status];
                return (
                  <tr key={inv.invoiceNo} className="border-t border-[var(--line)] hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#1D9E75]">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#19382b]">{inv.patient}</td>
                    <td className="py-3 pr-4 text-[#6c857a]">{inv.date}</td>
                    <td className="py-3 pr-4 font-semibold tabular-nums text-[#19382b]">{inv.amount}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.pill}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </WorkspaceLayout>
  );
}