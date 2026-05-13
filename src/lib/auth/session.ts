// Clinic session — stored in localStorage so it survives page refreshes.
// Supabase Auth handles the JWT; this layer stores the resolved clinic identity.

const SESSION_KEY = "cc_clinic_session";

export type ClinicSession = {
  clinicId: string;
  clinicName: string;
  clinicCode: string;
  clinicStatus: string;
};

export function getClinicSession(): ClinicSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ClinicSession;
  } catch {
    return null;
  }
}

export function setClinicSession(session: ClinicSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearClinicSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentClinicId(): string | null {
  return getClinicSession()?.clinicId ?? null;
}
