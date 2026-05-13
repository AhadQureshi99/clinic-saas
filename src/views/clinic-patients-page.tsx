import { useEffect, useState } from "react";
import { WorkspaceLayout } from "@/components/workspace-layout";
import {
  createPatient,
  fallbackPatients,
  getPatients,
  type PatientRecord,
} from "@/lib/data/clinic-operations";
import { deletePatient } from "@/lib/data/onboarding";
import { clinicNavigation } from "@/lib/navigation";

export function ClinicPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>(fallbackPatients);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientCode: "",
    fullName: "",
    idNo: "",
    phone: "",
    dateOfBirth: "",
  });

  async function loadPatients() {
    const result = await getPatients();
    setPatients(result);
  }

  useEffect(() => {
    void loadPatients();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      await createPatient(form);
      await loadPatients();
      setForm({ patientCode: "", fullName: "", idNo: "", phone: "", dateOfBirth: "" });
      setMessage("Patient registered successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to register patient.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(patientId: string) {
    try {
      await deletePatient(patientId);
      await loadPatients();
      setMessage("Patient deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete patient.");
    }
  }

  return (
    <WorkspaceLayout
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
    >
      <section className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
          Patients
        </p>
        <h1 className="display-font mt-2 text-3xl text-[#1b3027]">
          Registration and Visit Tracking
        </h1>
        <p className="mt-2 text-sm text-[#4c5f55]">
          Register patients with clinic-specific IDs, contact details, and visit readiness.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[#284238]">Patient code</span>
            <input
              value={form.patientCode}
              onChange={(event) => setForm((current) => ({ ...current, patientCode: event.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
              placeholder="P-10461"
            />
          </label>
          <label className="space-y-2 text-sm xl:col-span-2">
            <span className="font-semibold text-[#284238]">Full name</span>
            <input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[#284238]">MyKad / ID</span>
            <input
              value={form.idNo}
              onChange={(event) => setForm((current) => ({ ...current, idNo: event.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[#284238]">Phone</span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-[#284238]">Date of birth</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
            />
          </label>
          <div className="flex items-end xl:col-span-4 gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Register Patient"}
            </button>
            {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
          </div>
        </form>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.13em] text-[#6c857a]">
              <tr>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Patient ID</th>
                <th className="pb-3">MyKad / ID</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">DOB</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t border-[var(--line)]">
                  <td className="py-3 font-semibold text-[#19382b]">{patient.fullName}</td>
                  <td className="py-3 text-[#33473d]">{patient.patientCode}</td>
                  <td className="py-3 text-[#33473d]">{patient.idNo || "-"}</td>
                  <td className="py-3 text-[#33473d]">{patient.phone || "-"}</td>
                  <td className="py-3 text-[#33473d]">{patient.dateOfBirth || "-"}</td>
                  <td className="py-3">
                    <button
                      onClick={() => void handleDelete(patient.id)}
                      className="rounded-lg border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[#6a342a] hover:bg-[#fff3ef]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceLayout>
  );
}