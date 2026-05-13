import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  fallbackClinicProfile,
  fallbackSignupRequests,
  type ClinicPortalAccess,
  type SignupRequestRecord,
} from "@/lib/data/clinic-operations";
import {
  clearClinicSession,
  getCurrentClinicId,
  setClinicSession,
} from "@/lib/auth/session";

async function appendAuditLog(input: {
  clinicId?: string | null;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
}) {
  if (!hasSupabaseEnv) return;
  try {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("audit_logs").insert({
      clinic_id: input.clinicId ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      details: { actor: input.actor, ...input.details },
    });
  } catch {
    // Fail soft.
  }
}

export async function getClinicSignupRequests(): Promise<SignupRequestRecord[]> {
  if (!hasSupabaseEnv) return fallbackSignupRequests;

  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("clinic_signup_requests")
      .select("id, clinic_name, contact_name, email, phone, desired_code, branch_count, notes, request_status, admin_note, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) return fallbackSignupRequests;

    return data.map((item) => ({
      id: item.id,
      clinicName: item.clinic_name,
      contactName: item.contact_name,
      email: item.email,
      phone: item.phone,
      desiredCode: item.desired_code,
      branchCount: item.branch_count,
      notes: item.notes ?? "",
      requestStatus: item.request_status,
      adminNote: item.admin_note ?? "",
      createdAt: item.created_at,
    }));
  } catch {
    return fallbackSignupRequests;
  }
}

/**
 * Register a new clinic:
 * 1. Create a Supabase Auth account (email + password).
 * 2. Insert the clinic signup request (pending admin approval) with the auth user ID.
 */
export async function createClinicSignupRequest(input: {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  desiredCode: string;
  branchCount: number;
  notes: string;
  password: string;
}) {
  if (!hasSupabaseEnv) return;

  const supabase = createSupabaseBrowserClient();
  const normalizedCode = input.desiredCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

  // Step 1: Create Supabase Auth user.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message ?? "Unable to create account. The email may already be registered.");
  }

  // Step 2: Insert clinic signup request linked to the auth user.
  const { data, error } = await supabase
    .from("clinic_signup_requests")
    .insert({
      clinic_name: input.clinicName.trim(),
      contact_name: input.contactName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      desired_code: normalizedCode,
      branch_count: input.branchCount,
      notes: input.notes.trim() || null,
      request_status: "pending",
      auth_user_id: authData.user.id,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Unable to submit clinic signup request.");
  }

  await appendAuditLog({
    clinicId: null,
    actor: "public",
    action: "clinic_signup_requested",
    entityType: "clinic_signup_request",
    entityId: data.id,
    details: { desiredCode: normalizedCode, email: input.email.trim().toLowerCase() },
  });
}

/**
 * Admin review: approve or reject a clinic signup request.
 * On approval, creates the clinic record and links the auth user.
 */
export async function reviewClinicSignupRequest(
  requestId: string,
  decision: "approved" | "rejected",
  adminNote: string,
) {
  if (!hasSupabaseEnv) return;

  const supabase = createSupabaseBrowserClient();
  const { data: request, error: requestError } = await supabase
    .from("clinic_signup_requests")
    .select("id, clinic_name, contact_name, email, phone, desired_code, branch_count, auth_user_id")
    .eq("id", requestId)
    .maybeSingle();

  if (requestError || !request) {
    throw new Error(requestError?.message ?? "Unable to find signup request.");
  }

  let clinicId: string | null = null;

  if (decision === "approved") {
    const { data: existingClinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("code", request.desired_code)
      .maybeSingle();

    if (existingClinic?.id) {
      clinicId = existingClinic.id;
      // Link auth user if not already set.
      if (request.auth_user_id) {
        await supabase
          .from("clinics")
          .update({ auth_user_id: request.auth_user_id })
          .eq("id", clinicId);
      }
    } else {
      const { data: createdClinic, error: clinicError } = await supabase
        .from("clinics")
        .insert({
          code: request.desired_code,
          name: request.clinic_name,
          phone: request.phone,
          email: request.email,
          status: "active",
          auth_user_id: request.auth_user_id ?? null,
        })
        .select("id")
        .single();

      if (clinicError || !createdClinic?.id) {
        throw new Error(clinicError?.message ?? "Unable to create approved clinic.");
      }

      clinicId = createdClinic.id;

      const today = new Date();
      const periodEnd = new Date(today);
      periodEnd.setDate(periodEnd.getDate() + 30);
      await supabase.from("subscriptions").insert({
        clinic_id: clinicId,
        plan_name: request.branch_count > 1 ? "Growth" : "Standard",
        status: "active",
        amount_cents: request.branch_count > 1 ? 49900 : 29900,
        period_start: today.toISOString().slice(0, 10),
        period_end: periodEnd.toISOString().slice(0, 10),
      });
    }
  }

  const { error: updateError } = await supabase
    .from("clinic_signup_requests")
    .update({
      request_status: decision,
      admin_note: adminNote.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (updateError) throw new Error(updateError.message);

  await appendAuditLog({
    clinicId,
    actor: "super_admin",
    action: `clinic_signup_${decision}`,
    entityType: "clinic_signup_request",
    entityId: requestId,
    details: { desiredCode: request.desired_code, adminNote: adminNote.trim() },
  });
}

/**
 * Log in with email + password.
 * Checks that the clinic is approved and active, then stores the session.
 */
export async function loginWithEmailPassword(
  email: string,
  password: string,
): Promise<ClinicPortalAccess> {
  if (!hasSupabaseEnv) {
    // Fallback for local dev without Supabase.
    setClinicSession({
      clinicId: fallbackClinicProfile.id,
      clinicName: fallbackClinicProfile.name,
      clinicCode: fallbackClinicProfile.code,
      clinicStatus: fallbackClinicProfile.status,
    });
    return {
      id: fallbackClinicProfile.id,
      code: fallbackClinicProfile.code,
      name: fallbackClinicProfile.name,
      status: fallbackClinicProfile.status,
    };
  }

  const supabase = createSupabaseBrowserClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData.user) {
    throw new Error("Invalid email or password.");
  }

  // Find the clinic linked to this auth user.
  const { data: clinic, error: clinicError } = await supabase
    .from("clinics")
    .select("id, code, name, status")
    .eq("auth_user_id", authData.user.id)
    .maybeSingle();

  if (clinicError || !clinic) {
    await supabase.auth.signOut();
    throw new Error("No approved clinic account found for this email. Your signup may still be pending admin review.");
  }

  if (clinic.status === "suspended" || clinic.status === "terminated") {
    await supabase.auth.signOut();
    throw new Error("Clinic access is restricted. Contact support or billing admin.");
  }

  setClinicSession({
    clinicId: clinic.id,
    clinicName: clinic.name,
    clinicCode: clinic.code,
    clinicStatus: clinic.status,
  });

  return { id: clinic.id, code: clinic.code, name: clinic.name, status: clinic.status };
}

/** Sign out and clear the local clinic session. */
export async function logoutClinic(): Promise<void> {
  clearClinicSession();
  if (!hasSupabaseEnv) return;
  try {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  } catch {
    // Fail soft — local session is already cleared.
  }
}

export async function deletePatient(patientId: string) {
  if (!hasSupabaseEnv) return;

  const supabase = createSupabaseBrowserClient();
  const clinicId = getCurrentClinicId();
  const { error } = await supabase.from("patients").delete().eq("id", patientId);

  if (error) throw new Error(error.message);

  await appendAuditLog({
    clinicId,
    actor: "clinic_staff",
    action: "patient_deleted",
    entityType: "patient",
    entityId: patientId,
    details: {},
  });
}

export async function deleteInventoryItem(itemId: string) {
  if (!hasSupabaseEnv) return;

  const supabase = createSupabaseBrowserClient();
  const clinicId = getCurrentClinicId();
  const { error } = await supabase.from("inventory").delete().eq("id", itemId);

  if (error) throw new Error(error.message);

  await appendAuditLog({
    clinicId,
    actor: "pharmacy_staff",
    action: "inventory_deleted",
    entityType: "inventory",
    entityId: itemId,
    details: {},
  });
}
