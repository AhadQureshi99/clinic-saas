import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { clinicNavigation } from "@/lib/navigation";
import { logoutClinic } from "@/lib/data/onboarding";
import {
  BANK_DETAILS,
  uploadPaymentProof,
  getPaymentHistory,
  getClinicSubscription,
  type PaymentProofRecord,
  type ClinicSubscriptionInfo,
} from "@/lib/payments";

const STATUS_BADGE: Record<string, string> = {
  verified: "bg-[#E1F5EE] text-[#0F6E56]",
  pending:  "bg-[#FFF8E1] text-[#8B6000]",
  rejected: "bg-[#FDECEA] text-[#8B1A10]",
};

function fmtRM(cents: number) {
  return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function ClinicBillingPage() {
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<ClinicSubscriptionInfo | null>(null);
  const [history, setHistory] = useState<PaymentProofRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [amount, setAmount] = useState("299.00");
  const [transactionReference, setTransactionReference] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const amountCents = useMemo(() => {
    const parsed = Number.parseFloat(amount);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
  }, [amount]);

  useEffect(() => {
    let mounted = true;
    void getClinicSubscription().then((s) => { if (mounted) setSubscription(s); });
    void getPaymentHistory().then((h) => {
      if (mounted) { setHistory(h); setLoadingHistory(false); }
    });
    return () => { mounted = false; };
  }, []);

  async function handleLogout() {
    await logoutClinic();
    navigate("/login");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setMessage({ text: "Please choose a payment screenshot image.", ok: false });
      return;
    }
    if (!transactionReference.trim()) {
      setMessage({ text: "Please enter the bank transaction reference.", ok: false });
      return;
    }
    if (amountCents <= 0) {
      setMessage({ text: "Please enter a valid payment amount.", ok: false });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ text: "Uploading screenshot...", ok: true });

      await uploadPaymentProof({
        amountCents,
        transactionReference: transactionReference.trim(),
        file: selectedFile,
      });

      setMessage({ text: "Payment proof submitted. The admin will verify and activate your account.", ok: true });
      setSelectedFile(null);
      setTransactionReference("");

      const updated = await getPaymentHistory();
      setHistory(updated);
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Upload failed.", ok: false });
    } finally {
      setSubmitting(false);
    }
  }

  const subStatusColor =
    subscription?.status === "active" ? "text-[#0F6E56]"
    : subscription?.status === "grace_period" ? "text-[#8B6000]"
    : "text-[#8B1A10]";

  return (
    <WorkspaceLayout
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      onLogout={() => void handleLogout()}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ui-kicker">Subscription & Payments</p>
          <h1 className="ui-title mt-1">Software Subscription Billing</h1>
          <p className="mt-1 text-sm text-[#5d665f]">
            Transfer to our bank account and upload your screenshot to activate or renew.
          </p>
        </div>
      </div>

      {/* Subscription status */}
      <div className="ui-panel grid gap-5 p-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7a817b]">Current Plan</p>
          <p className="mt-1 text-xl font-semibold text-[#1a1a18]">{subscription?.planName ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7a817b]">Status</p>
          <p className={`mt-1 text-xl font-semibold capitalize ${subStatusColor}`}>
            {subscription?.status?.replace(/_/g, " ") ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7a817b]">Renews / Expires</p>
          <p className="mt-1 text-xl font-semibold text-[#1a1a18]">
            {subscription ? fmtDate(subscription.periodEnd) : "—"}
          </p>
        </div>
      </div>

      {/* Bank account details */}
      <div className="ui-panel p-5">
        <p className="ui-kicker">How to Pay</p>
        <p className="mt-1 text-sm text-[#5d665f]">
          Transfer the subscription amount to the bank account below, then upload your screenshot.
        </p>
        <div className="mt-4 grid gap-3 rounded-xl border border-[#d4ece2] bg-[#F0FAF5] p-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a8070]">Bank</p>
            <p className="mt-1 font-semibold text-[#1a1a18]">{BANK_DETAILS.bankName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a8070]">Account Name</p>
            <p className="mt-1 font-semibold text-[#1a1a18]">{BANK_DETAILS.accountName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a8070]">Account Number</p>
            <p className="mt-1 font-semibold text-[#1a1a18]">{BANK_DETAILS.accountNumber}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5a8070]">Reference</p>
            <p className="mt-1 font-semibold text-[#1a1a18]">{BANK_DETAILS.reference}</p>
          </div>
        </div>
        {subscription && (
          <p className="mt-3 text-sm text-[#3f4842]">
            Monthly amount: <span className="font-semibold text-[#1D9E75]">{fmtRM(subscription.amountCents)}</span>
          </p>
        )}
      </div>

      {/* Upload form */}
      <div className="ui-panel p-5">
        <p className="ui-kicker">Submit Payment Proof</p>
        <p className="mt-1 text-sm text-[#5d665f]">
          After transferring, fill in the details below and attach your bank transfer screenshot.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold text-[#284238]">Amount Paid (RM)</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-2.5 outline-none focus:border-[#1D9E75]"
                placeholder="299.00"
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm">
              <span className="font-semibold text-[#284238]">Bank Transaction Reference</span>
              <input
                type="text"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-2.5 outline-none focus:border-[#1D9E75]"
                placeholder="e.g. FT26051300001234"
                required
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold text-[#284238]">
              Payment Screenshot{" "}
              <span className="font-normal text-[#5d665f]">(JPG, PNG)</span>
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full rounded-lg border border-[#ddd] bg-white px-4 py-2.5 text-sm file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#1D9E75] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
              required
            />
            {selectedFile ? <p className="text-xs text-[#3f4842]">Selected: {selectedFile.name}</p> : null}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#1D9E75] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Uploading..." : "Submit Payment Proof"}
            </button>
          </div>
          {message ? (
            <div className={`rounded-lg border px-4 py-3 text-sm ${message.ok ? "border-[#d4ece2] bg-[#F0FAF5] text-[#0F6E56]" : "border-[#fcd9d5] bg-[#FFF5F4] text-[#8B1A10]"}`}>
              {message.text}
            </div>
          ) : null}
        </form>
      </div>

      {/* Payment history */}
      <div className="ui-panel p-5">
        <p className="ui-kicker">Payment History</p>
        <p className="mt-1 text-sm text-[#5d665f]">All payment screenshots submitted by your clinic.</p>
        {loadingHistory ? (
          <p className="mt-4 text-sm text-[#7a817b]">Loading...</p>
        ) : history.length === 0 ? (
          <p className="mt-4 text-sm text-[#7a817b]">No payment proofs submitted yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.13em] text-[#7a817b]">
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Reference</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Admin Note</th>
                  <th className="pb-3">Screenshot</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id} className="border-t border-[#eeeee9]">
                    <td className="py-3 pr-4 text-[#3f4842]">{fmtDate(row.submittedAt)}</td>
                    <td className="py-3 pr-4 font-mono text-[#1a1a18]">{row.transactionReference}</td>
                    <td className="py-3 pr-4 font-semibold text-[#1a1a18]">{fmtRM(row.amountCents)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_BADGE[row.reviewStatus] ?? ""}`}>
                        {row.reviewStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-[#5d665f]">{row.reviewerNote ?? "—"}</td>
                    <td className="py-3">
                      <a
                        href={row.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1D9E75] underline-offset-2 hover:underline"
                      >
                        View
                      </a>
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
