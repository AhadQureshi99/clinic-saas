import { useEffect, useState } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { adminNavigation } from "@/lib/navigation";
import {
  fallbackAuditLogs,
  getAuditLogs,
  type AuditLogRecord,
} from "@/lib/data/clinic-operations";

const ACTION_BADGE: Record<string, string> = {
  clinic_signup_requested:  "bg-[#eff6ff] text-[#1e40af]",
  clinic_signup_approved:   "bg-[#dcfce7] text-[#166534]",
  clinic_signup_rejected:   "bg-[#fee2e2] text-[#991b1b]",
  patient_created:          "bg-[#f0fdf4] text-[#15803d]",
  patient_deleted:          "bg-[#fff1f2] text-[#9f1239]",
  appointment_created:      "bg-[#f0f9ff] text-[#0369a1]",
  appointment_updated:      "bg-[#fefce8] text-[#a16207]",
  inventory_item_deleted:   "bg-[#fdf4ff] text-[#7e22ce]",
};

function actionBadge(action: string) {
  return ACTION_BADGE[action] ?? "bg-[#f3f4f6] text-[#374151]";
}

function fmtDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogRecord[]>(fallbackAuditLogs);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    void getAuditLogs().then((result) => {
      if (mounted) setLogs(result);
    });
    return () => { mounted = false; };
  }, []);

  const filtered = filter.trim()
    ? logs.filter(
        (l) =>
          l.action.includes(filter.toLowerCase()) ||
          l.entityType.includes(filter.toLowerCase()) ||
          l.actor.toLowerCase().includes(filter.toLowerCase()),
      )
    : logs;

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const clinicEvents = logs.filter((l) => l.entityType === "clinic" || l.entityType === "clinic_signup_request").length;
  const patientEvents = logs.filter((l) => l.entityType === "patient").length;
  const adminEvents = logs.filter((l) => l.actor === "super_admin").length;

  return (
    <WorkspaceLayout
      title="Super Admin"
      subtitle="Subscription control and payment verification center."
      navItems={adminNavigation}
    >
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
            Admin — Audit
          </p>
          <h1 className="display-font mt-1 text-3xl text-[#1b3027]">Audit Logs</h1>
          <p className="mt-1 text-sm text-[#5d665f]">
            Every sensitive platform action is recorded here for compliance and support.
          </p>
        </div>
        <p className="text-sm text-[#6c857a]">{today}</p>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-[#bfdbfe] bg-[#eff6ff] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1e40af]">Total Events</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#1e40af]">{logs.length}</p>
          <p className="mt-2 text-xs text-[#4d6056]">in this session</p>
        </article>
        <article className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf6] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#166534]">Clinic Events</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#166534]">{clinicEvents}</p>
          <p className="mt-2 text-xs text-[#4d6056]">signup & approval actions</p>
        </article>
        <article className="rounded-2xl border border-[#fde68a] bg-[#fffbeb] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#92400e]">Admin Actions</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#92400e]">{adminEvents}</p>
          <p className="mt-2 text-xs text-[#4d6056]">performed by super_admin</p>
        </article>
      </div>

      {/* ── Log table ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Event Log
            </p>
            <h2 className="display-font mt-1 text-xl text-[#1b3027]">All Recorded Actions</h2>
          </div>
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by action, entity, or actor…"
            className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--brand)] sm:w-64"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[#6c857a]">
            No audit events found{filter ? ` for "${filter}"` : ""}.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Actor</th>
                  <th className="pb-3 pr-4">Action</th>
                  <th className="pb-3 pr-4">Entity</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-[var(--line)] align-top transition-colors hover:bg-[var(--surface-muted)]"
                  >
                    <td className="py-3 pr-4 text-xs font-medium text-[#3f4842] whitespace-nowrap">
                      {fmtDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-[#4c5f55]">{log.actor}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${actionBadge(log.action)}`}
                      >
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#3f4842]">
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId ? (
                        <span className="ml-1 font-mono text-[#7a817b]">/ {log.entityId.slice(0, 8)}…</span>
                      ) : null}
                    </td>
                    <td className="py-3 max-w-[240px] text-xs text-[#5d665f]">
                      <span className="line-clamp-2">{log.details}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
}
