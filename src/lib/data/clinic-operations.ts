import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getCurrentClinicId } from "@/lib/auth/session";

export type ClinicStatus = "active" | "grace_period" | "suspended" | "terminated";

export type ClinicProfile = {
  id: string;
  code: string;
  name: string;
  registrationNo: string;
  timezone: string;
  phone: string;
  email: string;
  address: string;
  defaultLanguage: string;
  bankAccountName: string;
  bankAccountNumber: string;
  status: ClinicStatus;
};

export type PatientRecord = {
  id: string;
  patientCode: string;
  fullName: string;
  idNo: string;
  phone: string;
  dateOfBirth: string;
};

export type AppointmentRecord = {
  id: string;
  patientId: string | null;
  patientName: string;
  doctorName: string;
  queueNo: string;
  status: string;
  appointmentAt: string;
};

export type EncounterRecord = {
  id: string;
  patientId: string | null;
  appointmentId: string | null;
  patientName: string;
  doctorName: string;
  chiefComplaint: string;
  assessment: string;
  treatmentPlan: string;
  status: "draft" | "completed";
  createdAt: string;
};

export type InventoryRecord = {
  id: string;
  itemName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  unit: string;
};

export type AuditLogRecord = {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
};

export type LandingOverview = {
  stats: Array<{ label: string; value: string; note: string }>;
  operations: Array<{ title: string; description: string; value: string }>;
  readiness: Array<{ title: string; tone: "good" | "warn" | "danger"; detail: string }>;
};

export type SignupRequestRecord = {
  id: string;
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  desiredCode: string;
  branchCount: number;
  notes: string;
  requestStatus: "pending" | "approved" | "rejected";
  adminNote: string;
  createdAt: string;
};

export type ClinicPortalAccess = {
  id: string;
  code: string;
  name: string;
  status: ClinicStatus;
};

export type ClinicAdminRow = {
  id: string;
  code: string;
  name: string;
  status: ClinicStatus;
  timezone: string;
  plan: string;
  amountLabel: string;
};

const defaultClinicCode = import.meta.env.VITE_DEFAULT_CLINIC_CODE ?? "demo-clinic";

export const fallbackClinicProfile: ClinicProfile = {
  id: "11111111-1111-4111-8111-111111111111",
  code: defaultClinicCode,
  name: "PulseDesk Demo Clinic",
  registrationNo: "MY-CLINIC-001",
  timezone: "Asia/Kuala_Lumpur",
  phone: "+60 12-345 6789",
  email: "ops@pulsedesk.demo",
  address: "22 Jalan Setia, Kuala Lumpur",
  defaultLanguage: "en",
  bankAccountName: "PulseDesk Demo Clinic",
  bankAccountNumber: "1234567890",
  status: "active",
};

export const fallbackPatients: PatientRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111112",
    patientCode: "P-10458",
    fullName: "Siti Mariam",
    idNo: "900101-14-5678",
    phone: "+60 17-111 2222",
    dateOfBirth: "1990-01-01",
  },
  {
    id: "11111111-1111-4111-8111-111111111113",
    patientCode: "P-10459",
    fullName: "Daniel Tan",
    idNo: "880305-10-4567",
    phone: "+60 16-444 5555",
    dateOfBirth: "1988-03-05",
  },
];

export const fallbackAppointments: AppointmentRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111114",
    patientId: fallbackPatients[0].id,
    patientName: "Siti Mariam",
    doctorName: "Dr. Lim",
    queueNo: "Q-082",
    status: "waiting",
    appointmentAt: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4111-8111-111111111115",
    patientId: fallbackPatients[1].id,
    patientName: "Daniel Tan",
    doctorName: "Dr. Chan",
    queueNo: "Q-083",
    status: "in_consultation",
    appointmentAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
];

export const fallbackEncounters: EncounterRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111117",
    patientId: fallbackPatients[0].id,
    appointmentId: fallbackAppointments[0].id,
    patientName: fallbackPatients[0].fullName,
    doctorName: "Dr. Lim",
    chiefComplaint: "Fever for two days with sore throat.",
    assessment: "Likely upper respiratory tract infection.",
    treatmentPlan: "Paracetamol, hydration, return if worsening.",
    status: "completed",
    createdAt: new Date().toISOString(),
  },
  {
    id: "11111111-1111-4111-8111-111111111118",
    patientId: fallbackPatients[1].id,
    appointmentId: fallbackAppointments[1].id,
    patientName: fallbackPatients[1].fullName,
    doctorName: "Dr. Chan",
    chiefComplaint: "Medication refill for gastritis.",
    assessment: "Stable follow-up visit.",
    treatmentPlan: "Continue medication for 2 weeks.",
    status: "draft",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const fallbackInventory: InventoryRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111119",
    itemName: "Amoxicillin 500mg",
    sku: "DRUG-AMOX-500",
    quantity: 24,
    reorderLevel: 30,
    unit: "capsules",
  },
  {
    id: "11111111-1111-4111-8111-111111111120",
    itemName: "Paracetamol 500mg",
    sku: "DRUG-PARA-500",
    quantity: 178,
    reorderLevel: 50,
    unit: "tablets",
  },
];

export const fallbackAuditLogs: AuditLogRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111121",
    createdAt: new Date().toISOString(),
    actor: "system",
    action: "payment_verified",
    entityType: "payment_proof",
    entityId: "demo-proof",
    details: "Manual payment proof verified by admin.",
  },
  {
    id: "11111111-1111-4111-8111-111111111122",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    actor: "clinic_staff",
    action: "patient_created",
    entityType: "patient",
    entityId: fallbackPatients[0].patientCode,
    details: "New patient registration captured at front desk.",
  },
];

export const fallbackAdminClinics: ClinicAdminRow[] = [
  {
    id: fallbackClinicProfile.id,
    code: fallbackClinicProfile.code,
    name: fallbackClinicProfile.name,
    status: "active",
    timezone: "Asia/Kuala_Lumpur",
    plan: "Standard",
    amountLabel: "RM 299.00",
  },
  {
    id: "11111111-1111-4111-8111-111111111116",
    code: "prima-clinic",
    name: "Kesihatan Prima",
    status: "grace_period",
    timezone: "Asia/Kuala_Lumpur",
    plan: "Basic",
    amountLabel: "RM 149.00",
  },
];

export const fallbackLandingOverview: LandingOverview = {
  stats: [
    { label: "Active Clinics", value: "2", note: "multi-tenant SaaS control" },
    { label: "Patients Recorded", value: String(fallbackPatients.length), note: "registration-ready records" },
    { label: "Appointments Today", value: String(fallbackAppointments.length), note: "front desk scheduling" },
  ],
  operations: [
    { title: "Front desk", description: "Patient registration, appointments, and queue handling.", value: `${fallbackPatients.length} patients` },
    { title: "Clinical notes", description: "Consultation notes with assessment and treatment plans.", value: `${fallbackEncounters.length} notes` },
    { title: "Billing control", description: "Manual payment review and clinic subscription states.", value: `${fallbackAdminClinics.length} clinics` },
  ],
  readiness: [
    { title: "Billing review", tone: "good", detail: "Payment proof workflow is live." },
    { title: "Operations", tone: "warn", detail: "Apply Supabase schema to unlock live writes." },
    { title: "Compliance", tone: "good", detail: "Audit logging surface is available for admin review." },
  ],
};

export const fallbackSignupRequests: SignupRequestRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111123",
    clinicName: "Klinik Sentosa",
    contactName: "Aina Rahim",
    email: "ops@kliniksentosa.my",
    phone: "+60 13-888 2211",
    desiredCode: "klinik-sentosa",
    branchCount: 2,
    notes: "Need front desk, billing, and prescription workflow.",
    requestStatus: "pending",
    adminNote: "",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "11111111-1111-4111-8111-111111111124",
    clinicName: "Klinik Harmoni Care",
    contactName: "Farah Yusuf",
    email: "hello@harmonicare.my",
    phone: "+60 12-777 4444",
    desiredCode: "harmoni-care",
    branchCount: 1,
    notes: "Single-branch family clinic onboarding request.",
    requestStatus: "pending",
    adminNote: "",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

async function appendAuditLog(input: {
  clinicId?: string | null;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
}) {
  if (!hasSupabaseEnv) {
    return;
  }

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
    // Fail soft so business actions still complete even if audit persistence is unavailable.
  }
}

/**
 * Returns the clinic ID from the active session.
 * Falls back to the demo clinic code if no session exists (dev/demo mode).
 */
async function resolveClinicId(): Promise<string> {
  const sessionId = getCurrentClinicId();
  if (sessionId) return sessionId;

  // Fallback: look up by env var clinic code (dev mode).
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase
    .from("clinics")
    .select("id")
    .eq("code", defaultClinicCode)
    .maybeSingle();

  if (data?.id) return data.id;
  return fallbackClinicProfile.id;
}

function formatCurrencyFromCents(amountCents: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amountCents / 100);
}

export async function getClinicProfile(): Promise<ClinicProfile> {
  if (!hasSupabaseEnv) {
    return fallbackClinicProfile;
  }

  try {
    const clinicId = await resolveClinicId();
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("clinics")
      .select("id, code, name, registration_no, timezone, phone, email, address, default_language, bank_account_name, bank_account_number, status")
      .eq("id", clinicId)
      .maybeSingle();

    if (error || !data) {
      return fallbackClinicProfile;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      registrationNo: data.registration_no ?? "",
      timezone: data.timezone ?? "Asia/Kuala_Lumpur",
      phone: data.phone ?? "",
      email: data.email ?? "",
      address: data.address ?? "",
      defaultLanguage: data.default_language ?? "en",
      bankAccountName: data.bank_account_name ?? "",
      bankAccountNumber: data.bank_account_number ?? "",
      status: data.status,
    };
  } catch {
    return fallbackClinicProfile;
  }
}

export async function updateClinicProfile(input: ClinicProfile) {
  if (!hasSupabaseEnv) {
    return fallbackClinicProfile;
  }

  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("clinics")
    .update({
      code: input.code.trim(),
      name: input.name.trim(),
      registration_no: input.registrationNo.trim() || null,
      timezone: input.timezone.trim(),
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      address: input.address.trim() || null,
      default_language: input.defaultLanguage.trim(),
      bank_account_name: input.bankAccountName.trim() || null,
      bank_account_number: input.bankAccountNumber.trim() || null,
      status: input.status,
    })
    .eq("id", input.id)
    .select("id, code, name, registration_no, timezone, phone, email, address, default_language, bank_account_name, bank_account_number, status")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to save clinic profile.");
  }

  await appendAuditLog({
    clinicId: data.id,
    actor: "clinic_admin",
    action: "clinic_profile_updated",
    entityType: "clinic",
    entityId: data.id,
    details: { code: data.code, name: data.name },
  });

  return getClinicProfile();
}

export async function getPatients(): Promise<PatientRecord[]> {
  if (!hasSupabaseEnv) {
    return fallbackPatients;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data, error } = await supabase
      .from("patients")
      .select("id, patient_code, full_name, id_no, phone, date_of_birth")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      return fallbackPatients;
    }

    return data.map((item) => ({
      id: item.id,
      patientCode: item.patient_code,
      fullName: item.full_name,
      idNo: item.id_no ?? "",
      phone: item.phone ?? "",
      dateOfBirth: item.date_of_birth ?? "",
    }));
  } catch {
    return fallbackPatients;
  }
}

export async function createPatient(input: Omit<PatientRecord, "id">) {
  if (!hasSupabaseEnv) {
    return;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { error } = await supabase.from("patients").insert({
      clinic_id: clinicId,
      patient_code: input.patientCode.trim(),
      full_name: input.fullName.trim(),
      id_no: input.idNo.trim() || null,
      phone: input.phone.trim() || null,
      date_of_birth: input.dateOfBirth || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    await appendAuditLog({
      clinicId,
      actor: "clinic_staff",
      action: "patient_created",
      entityType: "patient",
      entityId: input.patientCode.trim(),
      details: { fullName: input.fullName.trim() },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to create patient. Apply the Supabase schema and policies first.",
    );
  }
}

export async function getAppointments(): Promise<AppointmentRecord[]> {
  if (!hasSupabaseEnv) {
    return fallbackAppointments;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, patient_id, patient_name, doctor_name, queue_no, status, appointment_at")
      .eq("clinic_id", clinicId)
      .gte("appointment_at", start.toISOString())
      .order("appointment_at", { ascending: true })
      .limit(50);

    if (error || !data) {
      return fallbackAppointments;
    }

    return data.map((item) => ({
      id: item.id,
      patientId: item.patient_id,
      patientName: item.patient_name,
      doctorName: item.doctor_name,
      queueNo: item.queue_no ?? "",
      status: item.status,
      appointmentAt: item.appointment_at,
    }));
  } catch {
    return fallbackAppointments;
  }
}

export async function createAppointment(input: {
  patientId: string;
  doctorName: string;
  queueNo: string;
  appointmentAt: string;
  status: string;
}) {
  if (!hasSupabaseEnv) {
    return;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("full_name")
      .eq("id", input.patientId)
      .maybeSingle();

    if (patientError || !patient?.full_name) {
      throw new Error("Unable to resolve patient for appointment.");
    }

    const { error } = await supabase.from("appointments").insert({
      clinic_id: clinicId,
      patient_id: input.patientId,
      patient_name: patient.full_name,
      doctor_name: input.doctorName.trim(),
      queue_no: input.queueNo.trim() || null,
      status: input.status,
      appointment_at: input.appointmentAt,
    });

    if (error) {
      throw new Error(error.message);
    }

    await appendAuditLog({
      clinicId,
      actor: "clinic_staff",
      action: "appointment_created",
      entityType: "appointment",
      entityId: input.queueNo.trim() || input.patientId,
      details: { patientId: input.patientId, doctorName: input.doctorName.trim() },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to create appointment. Apply the Supabase schema and policies first.",
    );
  }
}

export async function getAdminClinics(): Promise<ClinicAdminRow[]> {
  if (!hasSupabaseEnv) {
    return fallbackAdminClinics;
  }

  const supabase = createSupabaseBrowserClient();
  const response = await supabase
    .from("clinics")
    .select("id, code, name, status, timezone, subscriptions(plan_name, amount_cents, created_at)")
    .order("created_at", { ascending: false })
    .limit(30);

  const { data, error } = response as {
    data: Array<{
      id: string;
      code: string;
      name: string;
      status: ClinicStatus;
      timezone: string;
      subscriptions?: { plan_name?: string; amount_cents?: number; created_at?: string }[] | null;
    }> | null;
    error: { message?: string } | null;
  };

  if (error || !data || data.length === 0) {
    return fallbackAdminClinics;
  }

  return data.map((item) => {
    const latestSubscription = item.subscriptions?.[0];

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      status: item.status,
      timezone: item.timezone,
      plan: latestSubscription?.plan_name ?? "No plan",
      amountLabel: latestSubscription?.amount_cents
        ? formatCurrencyFromCents(latestSubscription.amount_cents)
        : "RM 0.00",
    };
  });
}

export async function updateClinicStatus(clinicId: string, status: ClinicStatus) {
  if (!hasSupabaseEnv) {
    return;
  }

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.from("clinics").update({ status }).eq("id", clinicId);

  if (error) {
    throw new Error(error.message);
  }

  await appendAuditLog({
    clinicId,
    actor: "super_admin",
    action: "clinic_status_updated",
    entityType: "clinic",
    entityId: clinicId,
    details: { status },
  });
}

export async function getEncounters(): Promise<EncounterRecord[]> {
  if (!hasSupabaseEnv) {
    return fallbackEncounters;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data, error } = await supabase
      .from("encounters")
      .select("id, patient_id, appointment_id, patient_name, doctor_name, chief_complaint, assessment, treatment_plan, encounter_status, created_at")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) {
      return fallbackEncounters;
    }

    return data.map((item) => ({
      id: item.id,
      patientId: item.patient_id,
      appointmentId: item.appointment_id,
      patientName: item.patient_name,
      doctorName: item.doctor_name,
      chiefComplaint: item.chief_complaint ?? "",
      assessment: item.assessment ?? "",
      treatmentPlan: item.treatment_plan ?? "",
      status: item.encounter_status,
      createdAt: item.created_at,
    }));
  } catch {
    return fallbackEncounters;
  }
}

export async function createEncounter(input: {
  patientId: string;
  appointmentId?: string;
  doctorName: string;
  chiefComplaint: string;
  assessment: string;
  treatmentPlan: string;
  status: "draft" | "completed";
}) {
  if (!hasSupabaseEnv) {
    return;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("full_name")
      .eq("id", input.patientId)
      .maybeSingle();

    if (patientError || !patient?.full_name) {
      throw new Error("Unable to resolve patient for consultation note.");
    }

    const { data, error } = await supabase
      .from("encounters")
      .insert({
        clinic_id: clinicId,
        patient_id: input.patientId,
        appointment_id: input.appointmentId || null,
        patient_name: patient.full_name,
        doctor_name: input.doctorName.trim(),
        chief_complaint: input.chiefComplaint.trim() || null,
        assessment: input.assessment.trim() || null,
        treatment_plan: input.treatmentPlan.trim() || null,
        encounter_status: input.status,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "Unable to save consultation note.");
    }

    await appendAuditLog({
      clinicId,
      actor: "doctor",
      action: "encounter_saved",
      entityType: "encounter",
      entityId: data.id,
      details: { patientId: input.patientId, status: input.status },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to save consultation note. Apply the Supabase schema and policies first.",
    );
  }
}

export async function getInventoryItems(): Promise<InventoryRecord[]> {
  if (!hasSupabaseEnv) {
    return fallbackInventory;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data, error } = await supabase
      .from("inventory")
      .select("id, item_name, sku, quantity, reorder_level, unit")
      .eq("clinic_id", clinicId)
      .order("item_name", { ascending: true })
      .limit(100);

    if (error || !data) {
      return fallbackInventory;
    }

    return data.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      sku: item.sku ?? "",
      quantity: item.quantity,
      reorderLevel: item.reorder_level,
      unit: item.unit,
    }));
  } catch {
    return fallbackInventory;
  }
}

export async function saveInventoryItem(input: Omit<InventoryRecord, "id">) {
  if (!hasSupabaseEnv) {
    return;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data, error } = await supabase
      .from("inventory")
      .upsert(
        {
          clinic_id: clinicId,
          item_name: input.itemName.trim(),
          sku: input.sku.trim() || null,
          quantity: input.quantity,
          reorder_level: input.reorderLevel,
          unit: input.unit.trim() || "box",
        },
        { onConflict: "clinic_id,item_name" },
      )
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "Unable to save inventory item.");
    }

    await appendAuditLog({
      clinicId,
      actor: "pharmacy_staff",
      action: "inventory_saved",
      entityType: "inventory",
      entityId: data.id,
      details: { itemName: input.itemName.trim(), quantity: input.quantity },
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unable to save inventory item. Apply the Supabase schema and policies first.",
    );
  }
}

export async function getAuditLogs(): Promise<AuditLogRecord[]> {
  if (!hasSupabaseEnv) {
    return fallbackAuditLogs;
  }

  try {
    const supabase = createSupabaseBrowserClient();
    const clinicId = await resolveClinicId();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, created_at, action, entity_type, entity_id, details")
      .or(`clinic_id.eq.${clinicId},clinic_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data) {
      return fallbackAuditLogs;
    }

    return data.map((item) => ({
      id: item.id,
      createdAt: item.created_at,
      actor: typeof item.details?.actor === "string" ? item.details.actor : "system",
      action: item.action,
      entityType: item.entity_type,
      entityId: item.entity_id ?? "-",
      details: JSON.stringify(item.details ?? {}),
    }));
  } catch {
    return fallbackAuditLogs;
  }
}

export async function getLandingOverview(): Promise<LandingOverview> {
  if (!hasSupabaseEnv) {
    return fallbackLandingOverview;
  }

  try {
    const [clinics, patients, appointments, encounters, inventoryItems] = await Promise.all([
      getAdminClinics(),
      getPatients(),
      getAppointments(),
      getEncounters(),
      getInventoryItems(),
    ]);

    const lowStockCount = inventoryItems.filter((item) => item.quantity <= item.reorderLevel).length;
    const pendingNotes = encounters.filter((item) => item.status === "draft").length;
    const activeClinicCount = clinics.filter((item) => item.status === "active").length;
    const graceClinicCount = clinics.filter((item) => item.status === "grace_period").length;

    return {
      stats: [
        { label: "Active Clinics", value: String(activeClinicCount), note: "tenants currently live" },
        { label: "Patients Recorded", value: String(patients.length), note: "registration database" },
        { label: "Appointments Today", value: String(appointments.length), note: "front desk schedule" },
      ],
      operations: [
        { title: "Registration", description: "Patient, appointment, and queue flow for clinic staff.", value: `${patients.length} patients` },
        { title: "Consultation", description: "Doctor note capture with assessment and treatment plan.", value: `${encounters.length} notes` },
        { title: "Inventory", description: "Medicine stock and reorder monitoring.", value: `${inventoryItems.length} items` },
      ],
      readiness: [
        { title: "Clinic billing", tone: graceClinicCount > 0 ? "warn" : "good", detail: `${graceClinicCount} clinics in grace period` },
        { title: "Clinical notes", tone: pendingNotes > 0 ? "warn" : "good", detail: `${pendingNotes} draft encounters awaiting completion` },
        { title: "Stock risk", tone: lowStockCount > 0 ? "danger" : "good", detail: `${lowStockCount} items at or below reorder level` },
      ],
    };
  } catch {
    return fallbackLandingOverview;
  }
}
