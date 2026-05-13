import { useEffect, useState } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { adminNavigation } from "@/lib/navigation";
import {
  fallbackAdminPayments,
  getAdminPendingPayments,
  type AdminPaymentItem,
} from "@/lib/data/dashboard";
import {
  getClinicSignupRequests,
  reviewClinicSignupRequest,
} from "@/lib/data/onboarding";
import { type SignupRequestRecord, fallbackSignupRequests } from "@/lib/data/clinic-operations";
import { setPaymentProofReviewStatus } from "@/lib/payments";

// ── Derived platform KPIs ────────────────────────────────────────
function buildAdminStats(
  payments: AdminPaymentItem[],
  signups: SignupRequestRecord[],
) {
  return [
    {
      label: "Pending Approvals",
      value: String(signups.filter((s) => s.requestStatus === "pending").length),
      note: "clinic signup requests",
      color: "amber" as const,
    },
    {
      label: "Pending Payments",
      value: String(payments.length),
      note: "awaiting verification",
      color: "red" as const,
    },
    {
      label: "Approved Clinics",
      value: String(signups.filter((s) => s.requestStatus === "approved").length),
      note: "active on platform",
      color: "green" as const,
    },
    {
      label: "Total Applications",
      value: String(signups.length),
      note: "all time",
      color: "blue" as const,
    },
  ];
}

const STAT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  green: { bg: "bg-[#f0fdf6]", border: "border-[#bbf7d0]", text: "text-[#166534]" },
  blue:  { bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]", text: "text-[#1e40af]" },
  amber: { bg: "bg-[#fffbeb]", border: "border-[#fde68a]", text: "text-[#92400e]" },
  red:   { bg: "bg-[#fff1f2]", border: "border-[#fecdd3]", text: "text-[#991b1b]" },
};

const SIGNUP_STATUS_BADGE: Record<string, string> = {
  pending:  "bg-[#fef9c3] text-[#854d0e]",
  approved: "bg-[#dcfce7] text-[#166534]",
  rejected: "bg-[#fee2e2] text-[#991b1b]",
};

export function AdminPage() {
  const [paymentProofQueue, setPaymentProofQueue] = useState<AdminPaymentItem[]>(fallbackAdminPayments);
  const [signupRequests, setSignupRequests] = useState<SignupRequestRecord[]>(fallbackSignupRequests);
  const [signupNotes, setSignupNotes] = useState<Record<string, string>>({});
  const [actionStatus, setActionStatus] = useState<string>("");

  async function loadAdminData() {
    const [payments, requests] = await Promise.all([
      getAdminPendingPayments(),
      getClinicSignupRequests(),
    ]);
    setPaymentProofQueue(payments);
    setSignupRequests(requests);
  }

  useEffect(() => {
    let mounted = true;
    void Promise.all([getAdminPendingPayments(), getClinicSignupRequests()]).then(([payments, requests]) => {
      if (mounted) {
        setPaymentProofQueue(payments);
        setSignupRequests(requests);
      }
    });
    return () => { mounted = false; };
  }, []);

  async function handleReview(proofId: string, reviewStatus: "verified" | "rejected", transactionReference: string) {
    try {
      setActionStatus(`${reviewStatus === "verified" ? "Verifying" : "Rejecting"} ${transactionReference}...`);
      await setPaymentProofReviewStatus(proofId, reviewStatus, `${reviewStatus === "verified" ? "Verified" : "Rejected"} from admin dashboard`);
      await loadAdminData();
      setActionStatus(reviewStatus === "verified" ? `Payment verified for ${transactionReference}` : `Payment rejected for ${transactionReference}`);
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Unable to update payment review.");
    }
  }

  async function handleSignupReview(requestId: string, decision: "approved" | "rejected") {
    try {
      setActionStatus(`${decision === "approved" ? "Approving" : "Rejecting"} clinic application...`);
      await reviewClinicSignupRequest(requestId, decision, signupNotes[requestId] || `${decision === "approved" ? "Approved" : "Rejected"} from admin dashboard`);
      await loadAdminData();
      setActionStatus(decision === "approved" ? "Clinic application approved." : "Clinic application rejected.");
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : "Unable to review clinic application.");
    }
  }

  const adminStats = buildAdminStats(paymentProofQueue, signupRequests);
  const pendingSignups = signupRequests.filter((r) => r.requestStatus === "pending");

  const today = new Date().toLocaleDateString("en-MY", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

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
            Admin Dashboard
          </p>
          <h1 className="display-font mt-1 text-3xl text-[#1b3027]">
            Platform Overview
          </h1>
        </div>
        <p className="text-sm text-[#6c857a]">{today}</p>
      </div>

      {/* ── Platform KPI cards ──────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => {
          const s = STAT_STYLES[stat.color];
          return (
            <article key={stat.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${s.text}`}>
                {stat.label}
              </p>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${s.text}`}>
                {stat.value}
              </p>
              <p className="mt-2 text-xs text-[#4d6056]">{stat.note}</p>
            </article>
          );
        })}
      </div>

      {/* ── Action status toast ─────────────────────────────────── */}
      {actionStatus ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[#284238]">
          {actionStatus}
        </div>
      ) : null}

      {/* ── Clinic Signup Approval ──────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Clinic Approval Queue
            </p>
            <h2 className="display-font mt-1 text-xl text-[#1b3027]">Pending Signup Requests</h2>
            <p className="mt-1 text-xs text-[#4c5f55]">Only approved clinics can access the login page.</p>
          </div>
          <span className="rounded-full bg-[#fef9c3] px-3 py-1 text-xs font-semibold text-[#854d0e]">
            {pendingSignups.length} pending
          </span>
        </div>

        {pendingSignups.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[#6c857a]">
            No pending signup requests.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                  <th className="pb-3 pr-4">Clinic</th>
                  <th className="pb-3 pr-4">Contact</th>
                  <th className="pb-3 pr-4">Code</th>
                  <th className="pb-3 pr-4">Branches</th>
                  <th className="pb-3 pr-4">Notes</th>
                  <th className="pb-3 pr-4">Admin Note</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingSignups.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--line)] align-top hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="py-3 pr-4 font-semibold text-[#19382b]">{item.clinicName}</td>
                    <td className="py-3 pr-4 text-[#33473d]">
                      <div className="font-medium">{item.contactName}</div>
                      <div className="text-xs text-[#65796d]">{item.email}</div>
                      <div className="text-xs text-[#65796d]">{item.phone}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md bg-[#f0fdf6] px-2 py-0.5 font-mono text-xs font-semibold text-[#166534]">
                        {item.desiredCode}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#33473d]">{item.branchCount}</td>
                    <td className="py-3 pr-4 text-xs text-[#4c5f55]">{item.notes || "—"}</td>
                    <td className="py-3 pr-4">
                      <textarea
                        rows={2}
                        value={signupNotes[item.id] ?? ""}
                        onChange={(event) => setSignupNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                        className="w-full min-w-[160px] rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-xs outline-none focus:border-[var(--brand)]"
                        placeholder="Approval note…"
                      />
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => void handleSignupReview(item.id, "approved")}
                          className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => void handleSignupReview(item.id, "rejected")}
                          className="rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payment Proof Review ────────────────────────────────── */}
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Payment Verification
            </p>
            <h2 className="display-font mt-1 text-xl text-[#1b3027]">Pending Payment Proofs</h2>
            <p className="mt-1 text-xs text-[#4c5f55]">
              Clinics upload transfer screenshots. Verify to activate subscriptions.
            </p>
          </div>
          <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-xs font-semibold text-[#991b1b]">
            {paymentProofQueue.length} pending
          </span>
        </div>

        {paymentProofQueue.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[#6c857a]">
            No pending payment proofs.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                  <th className="pb-3 pr-4">Clinic</th>
                  <th className="pb-3 pr-4">Plan</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Submitted</th>
                  <th className="pb-3 pr-4">Receipt</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {paymentProofQueue.map((item) => (
                  <tr key={item.proofId} className="border-t border-[var(--line)] hover:bg-[var(--surface-muted)] transition-colors">
                    <td className="py-3 pr-4 font-semibold text-[#19382b]">{item.clinic}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-md bg-[#eff6ff] px-2 py-0.5 text-xs font-semibold text-[#1e40af]">
                        {item.plan}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold tabular-nums text-[#19382b]">{item.amount}</td>
                    <td className="py-3 pr-4 text-xs text-[#6c857a]">{item.submittedAt}</td>
                    <td className="py-3 pr-4">
                      <a
                        href={item.screenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[#22453b] hover:bg-[var(--surface-muted)] transition-colors"
                      >
                        View Receipt
                      </a>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReview(item.proofId, "verified", item.transactionReference)}
                          className="rounded-lg bg-[var(--brand)] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 transition-all"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleReview(item.proofId, "rejected", item.transactionReference)}
                          className="rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── All Signup Requests history ─────────────────────────── */}
      {signupRequests.filter((r) => r.requestStatus !== "pending").length > 0 && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            History
          </p>
          <h2 className="display-font mt-1 text-xl text-[#1b3027]">Reviewed Applications</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.13em] text-[#6c857a]">
                  <th className="pb-3 pr-4">Clinic</th>
                  <th className="pb-3 pr-4">Contact</th>
                  <th className="pb-3 pr-4">Code</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {signupRequests
                  .filter((r) => r.requestStatus !== "pending")
                  .map((item) => (
                    <tr key={item.id} className="border-t border-[var(--line)] hover:bg-[var(--surface-muted)] transition-colors">
                      <td className="py-3 pr-4 font-semibold text-[#19382b]">{item.clinicName}</td>
                      <td className="py-3 pr-4 text-[#33473d]">
                        <div>{item.contactName}</div>
                        <div className="text-xs text-[#65796d]">{item.email}</div>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-[#33473d]">{item.desiredCode}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${SIGNUP_STATUS_BADGE[item.requestStatus] ?? "bg-[#f1f5f9] text-[#475569]"}`}>
                          {item.requestStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

