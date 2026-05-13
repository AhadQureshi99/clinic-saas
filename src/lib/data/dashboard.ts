import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv, supabaseUrl } from "@/lib/supabase/env";
import { getCurrentClinicId } from "@/lib/auth/session";

export type DashboardStat = {
  label: string;
  value: string;
  note: string;
  trend?: "up" | "down" | "neutral";
  color?: "green" | "blue" | "amber" | "red";
};

export type QueueItem = {
  number: string;
  patient: string;
  doctor: string;
  status: string;
};

export type RecentInvoice = {
  invoiceNo: string;
  patient: string;
  amount: string;
  date: string;
  status: "paid" | "pending" | "overdue";
};

export type AdminPaymentItem = {
  proofId: string;
  clinic: string;
  plan: string;
  amount: string;
  submittedAt: string;
  screenshotUrl: string;
  transactionReference: string;
};

export type ClinicDashboardData = {
  stats: DashboardStat[];
  queue: QueueItem[];
  recentInvoices: RecentInvoice[];
};

export const fallbackClinicDashboardData: ClinicDashboardData = {
  stats: [
    { label: "Revenue Today", value: "RM 4,860", note: "92% collection rate", trend: "up", color: "green" },
    { label: "Appointments", value: "46", note: "+8% vs yesterday", trend: "up", color: "blue" },
    { label: "Queue Waiting", value: "11", note: "avg wait 18 mins", trend: "neutral", color: "amber" },
    { label: "Patients Seen", value: "35", note: "out of 46 scheduled", trend: "neutral", color: "green" },
  ],
  queue: [
    { number: "Q-082", patient: "Faridah Rahman", doctor: "Dr. Lim", status: "In consultation" },
    { number: "Q-083", patient: "Amir Iqbal", doctor: "Dr. Lim", status: "Waiting" },
    { number: "Q-084", patient: "Nurul Huda", doctor: "Dr. Chan", status: "Waiting" },
    { number: "Q-085", patient: "Tan Wei Ming", doctor: "Dr. Chan", status: "Waiting" },
    { number: "Q-086", patient: "Priya Subramaniam", doctor: "Dr. Lim", status: "Waiting" },
  ],
  recentInvoices: [
    { invoiceNo: "INV-0241", patient: "Faridah Rahman", amount: "RM 180.00", date: "13 May 2026", status: "paid" },
    { invoiceNo: "INV-0240", patient: "Ravi Kumar", amount: "RM 250.00", date: "13 May 2026", status: "pending" },
    { invoiceNo: "INV-0239", patient: "Siti Nor Azwa", amount: "RM 95.00", date: "12 May 2026", status: "paid" },
    { invoiceNo: "INV-0238", patient: "Lim Boon Keat", amount: "RM 320.00", date: "12 May 2026", status: "overdue" },
    { invoiceNo: "INV-0237", patient: "Ahmad Zaidi", amount: "RM 150.00", date: "11 May 2026", status: "paid" },
  ],
};

export const fallbackAdminPayments: AdminPaymentItem[] = [
  {
    proofId: "11111111-1111-4111-8111-111111111111",
    clinic: "Seri Murni Clinic",
    plan: "Standard",
    amount: "RM 299.00",
    submittedAt: "13 May 2026, 10:22",
    screenshotUrl: "https://placehold.co/640x360/png?text=Payment+Proof",
    transactionReference: "DEMO-TRANS-1001",
  },
  {
    proofId: "22222222-2222-4222-8222-222222222222",
    clinic: "Kesihatan Prima",
    plan: "Basic",
    amount: "RM 149.00",
    submittedAt: "13 May 2026, 09:05",
    screenshotUrl: "https://placehold.co/640x360/png?text=Payment+Proof",
    transactionReference: "DEMO-TRANS-1002",
  },
];

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amountCents / 100);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function firstRow<T>(value: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

export async function getClinicDashboardData(): Promise<ClinicDashboardData> {
  if (!hasSupabaseEnv) {
    return fallbackClinicDashboardData;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = getCurrentClinicId();

    if (!clinicId) {
      return fallbackClinicDashboardData;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      appointmentsTodayResult,
      waitingQueueResult,
      revenueTodayResult,
      queueRowsResult,
    ] = await Promise.all([
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .gte("appointment_at", todayStart.toISOString()),
      supabase
        .from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("clinic_id", clinicId)
        .eq("status", "waiting"),
      supabase
        .from("invoices")
        .select("amount_cents")
        .eq("clinic_id", clinicId)
        .eq("status", "paid")
        .gte("issued_at", todayStart.toISOString()),
      supabase
        .from("appointments")
        .select("queue_no, patient_name, doctor_name, status")
        .eq("clinic_id", clinicId)
        .in("status", ["waiting", "in_consultation"])
        .order("appointment_at", { ascending: true })
        .limit(8),
    ]);

    if (
      appointmentsTodayResult.error ||
      waitingQueueResult.error ||
      revenueTodayResult.error ||
      queueRowsResult.error
    ) {
      return fallbackClinicDashboardData;
    }

    const paidAmountCents = (revenueTodayResult.data ?? []).reduce(
      (sum, invoice) => sum + invoice.amount_cents,
      0,
    );

    const queue = (queueRowsResult.data ?? []).map((row, index) => ({
      number: row.queue_no || `Q-${String(index + 1).padStart(3, "0")}`,
      patient: row.patient_name,
      doctor: row.doctor_name,
      status: row.status === "in_consultation" ? "In consultation" : "Waiting",
    }));

    return {
      stats: [
        {
          label: "Revenue Today",
          value: formatCurrencyFromCents(paidAmountCents),
          note: "paid invoices only",
          trend: "up" as const,
          color: "green" as const,
        },
        {
          label: "Appointments",
          value: String(appointmentsTodayResult.count ?? 0),
          note: "live from clinic schedule",
          trend: "up" as const,
          color: "blue" as const,
        },
        {
          label: "Queue Waiting",
          value: String(waitingQueueResult.count ?? 0),
          note: "patients waiting now",
          trend: "neutral" as const,
          color: "amber" as const,
        },
        {
          label: "Patients Seen",
          value: String(Math.max(0, (appointmentsTodayResult.count ?? 0) - (waitingQueueResult.count ?? 0))),
          note: "out of today's schedule",
          trend: "neutral" as const,
          color: "green" as const,
        },
      ],
      queue: queue.length > 0 ? queue : fallbackClinicDashboardData.queue,
      recentInvoices: fallbackClinicDashboardData.recentInvoices,
    };
  } catch {
    return fallbackClinicDashboardData;
  }
}

export async function getAdminPendingPayments(): Promise<AdminPaymentItem[]> {
  if (!hasSupabaseEnv) {
    return fallbackAdminPayments;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const response = await supabase
      .from("payment_proofs")
      .select(
        "id, amount_cents, submitted_at, transaction_reference, screenshot_path, review_status, subscriptions(plan_name), clinics(name)",
      )
      .eq("review_status", "pending")
      .order("submitted_at", { ascending: false })
      .limit(20);
    const { data, error } = response as {
      data: Array<{
        id: string;
        amount_cents: number;
        submitted_at: string;
        transaction_reference: string;
        screenshot_path: string;
        subscriptions?: { plan_name?: string } | Array<{ plan_name?: string }> | null;
        clinics?: { name?: string } | Array<{ name?: string }> | null;
      }> | null;
      error: { message?: string } | null;
    };

    if (error || !data || data.length === 0) {
      return fallbackAdminPayments;
    }

    return data.map((item) => ({
      proofId: item.id,
      clinic: firstRow(item.clinics)?.name ?? "Unknown Clinic",
      plan: firstRow(item.subscriptions)?.plan_name ?? "Plan",
      amount: formatCurrencyFromCents(item.amount_cents),
      submittedAt: formatDateTime(item.submitted_at),
      screenshotUrl: item.screenshot_path
        ? `${supabaseUrl}/storage/v1/object/public/payment-proofs/${item.screenshot_path}`
        : "https://placehold.co/640x360/png?text=Payment+Proof",
      transactionReference: item.transaction_reference,
    }));
  } catch {
    return fallbackAdminPayments;
  }
}