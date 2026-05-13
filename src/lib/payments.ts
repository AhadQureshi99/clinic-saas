import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getCurrentClinicId } from "@/lib/auth/session";

export const PAYMENT_PROOFS_BUCKET = "payment-proofs";

/** Software owner bank account details — edit these to your real bank account. */
export const BANK_DETAILS = {
  bankName: import.meta.env.VITE_BANK_NAME ?? "Maybank",
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME ?? "Your Name Here",
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER ?? "1234 5678 9012",
  reference: "ClinicCloud Subscription",
};

export type PaymentProofRecord = {
  id: string;
  amountCents: number;
  transactionReference: string;
  screenshotUrl: string;
  reviewStatus: "pending" | "verified" | "rejected";
  reviewerNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

export type ClinicSubscriptionInfo = {
  planName: string;
  status: string;
  amountCents: number;
  periodStart: string;
  periodEnd: string;
};

export type UploadPaymentProofInput = {
  amountCents: number;
  transactionReference: string;
  file: File;
};

export type UploadPaymentProofResult = {
  proofId: string;
  screenshotPath: string;
  screenshotUrl: string;
};

function getFileExtension(fileName: string) {
  const index = fileName.lastIndexOf(".");
  return index >= 0 ? fileName.slice(index) : ".png";
}

function createStoragePath(clinicId: string, fileName: string) {
  return `${clinicId}/${Date.now()}-${crypto.randomUUID()}${getFileExtension(fileName)}`;
}

export async function uploadPaymentProof({
  amountCents,
  transactionReference,
  file,
}: UploadPaymentProofInput): Promise<UploadPaymentProofResult> {
  const supabase = createSupabaseBrowserClient();
  const clinicId = getCurrentClinicId();

  if (!clinicId) {
    throw new Error("No active clinic session. Please log in again.");
  }

  const screenshotPath = createStoragePath(clinicId, file.name);

  const { error: uploadError } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(screenshotPath, file, {
      contentType: file.type || "image/png",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error } = await supabase
    .from("payment_proofs")
    .insert({
      clinic_id: clinicId,
      amount_cents: amountCents,
      transaction_reference: transactionReference,
      screenshot_path: screenshotPath,
      review_status: "pending",
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to save payment proof.");
  }

  const { data: publicData } = supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .getPublicUrl(screenshotPath);

  return {
    proofId: data.id,
    screenshotPath,
    screenshotUrl: publicData.publicUrl,
  };
}

export async function getPaymentHistory(): Promise<PaymentProofRecord[]> {
  const supabase = createSupabaseBrowserClient();
  const clinicId = getCurrentClinicId();

  if (!clinicId) return [];

  const { data, error } = await supabase
    .from("payment_proofs")
    .select("id, amount_cents, transaction_reference, screenshot_path, review_status, reviewer_note, submitted_at, reviewed_at")
    .eq("clinic_id", clinicId)
    .order("submitted_at", { ascending: false })
    .limit(20);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    amountCents: row.amount_cents,
    transactionReference: row.transaction_reference,
    screenshotUrl: supabase.storage.from(PAYMENT_PROOFS_BUCKET).getPublicUrl(row.screenshot_path).data.publicUrl,
    reviewStatus: row.review_status as PaymentProofRecord["reviewStatus"],
    reviewerNote: row.reviewer_note ?? null,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at ?? null,
  }));
}

export async function getClinicSubscription(): Promise<ClinicSubscriptionInfo | null> {
  const supabase = createSupabaseBrowserClient();
  const clinicId = getCurrentClinicId();

  if (!clinicId) return null;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("plan_name, status, amount_cents, period_start, period_end")
    .eq("clinic_id", clinicId)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    planName: data.plan_name,
    status: data.status,
    amountCents: data.amount_cents,
    periodStart: data.period_start,
    periodEnd: data.period_end,
  };
}

export async function setPaymentProofReviewStatus(
  proofId: string,
  reviewStatus: "verified" | "rejected",
  reviewerNote?: string,
) {
  const supabase = createSupabaseBrowserClient();

  const { data: proof, error: fetchError } = await supabase
    .from("payment_proofs")
    .select("clinic_id")
    .eq("id", proofId)
    .maybeSingle();

  if (fetchError || !proof?.clinic_id) {
    throw new Error(fetchError?.message ?? "Unable to find payment proof.");
  }

  const { error: updateError } = await supabase
    .from("payment_proofs")
    .update({
      review_status: reviewStatus,
      reviewer_note: reviewerNote ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", proofId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  if (reviewStatus === "verified") {
    await supabase
      .from("clinics")
      .update({ status: "active" })
      .eq("id", proof.clinic_id);
  }
}