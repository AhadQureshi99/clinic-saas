import { useEffect, useState } from "react";
import { SectionPage } from "@/components/section-page";
import {
  createEncounter,
  fallbackAppointments,
  fallbackEncounters,
  fallbackPatients,
  getAppointments,
  getEncounters,
  getPatients,
  type AppointmentRecord,
  type EncounterRecord,
  type PatientRecord,
} from "@/lib/data/clinic-operations";
import { clinicNavigation } from "@/lib/navigation";

export function ClinicConsultationPage() {
  const [encounters, setEncounters] = useState<EncounterRecord[]>(fallbackEncounters);
  const [patients, setPatients] = useState<PatientRecord[]>(fallbackPatients);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(fallbackAppointments);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: fallbackPatients[0]?.id ?? "",
    appointmentId: fallbackAppointments[0]?.id ?? "",
    doctorName: "Dr. Lim",
    chiefComplaint: "",
    assessment: "",
    treatmentPlan: "",
    status: "draft" as "draft" | "completed",
  });

  async function loadData() {
    const [encountersResult, patientsResult, appointmentsResult] = await Promise.all([
      getEncounters(),
      getPatients(),
      getAppointments(),
    ]);
    setEncounters(encountersResult);
    setPatients(patientsResult);
    setAppointments(appointmentsResult);
    setForm((current) => ({
      ...current,
      patientId: current.patientId || patientsResult[0]?.id || "",
      appointmentId: current.appointmentId || appointmentsResult[0]?.id || "",
    }));
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      await createEncounter(form);
      await loadData();
      setForm((current) => ({
        ...current,
        chiefComplaint: "",
        assessment: "",
        treatmentPlan: "",
        status: "draft",
      }));
      setMessage("Consultation note saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save consultation note.");
    } finally {
      setSaving(false);
    }
  }

  const completedCount = encounters.filter((item) => item.status === "completed").length;
  const draftCount = encounters.filter((item) => item.status === "draft").length;

  return (
    <SectionPage
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      eyebrow="Consultation"
      heading="Doctor Notes, Diagnosis, and Orders"
      lead="This workspace should capture notes fast enough for real clinic flow, with templates for follow-up, referral, MC, and prescriptions."
      metrics={[
        { label: "Notes Recorded", value: String(encounters.length), note: "consultation sessions captured" },
        { label: "Draft Notes", value: String(draftCount), note: "awaiting completion" },
        { label: "Completed", value: String(completedCount), note: "finalized consultations" },
      ]}
    >
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Patient</span>
          <select
            value={form.patientId}
            onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName} ({patient.patientCode})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Appointment</span>
          <select
            value={form.appointmentId}
            onChange={(event) => setForm((current) => ({ ...current, appointmentId: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          >
            {appointments.map((appointment) => (
              <option key={appointment.id} value={appointment.id}>
                {appointment.patientName} - {appointment.doctorName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Doctor</span>
          <input
            value={form.doctorName}
            onChange={(event) => setForm((current) => ({ ...current, doctorName: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Note status</span>
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as "draft" | "completed" }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          >
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-[#284238]">Chief complaint</span>
          <textarea
            rows={3}
            value={form.chiefComplaint}
            onChange={(event) => setForm((current) => ({ ...current, chiefComplaint: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-[#284238]">Assessment</span>
          <textarea
            rows={3}
            value={form.assessment}
            onChange={(event) => setForm((current) => ({ ...current, assessment: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-[#284238]">Treatment plan</span>
          <textarea
            rows={3}
            value={form.treatmentPlan}
            onChange={(event) => setForm((current) => ({ ...current, treatmentPlan: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || !form.patientId}
            className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Consultation Note"}
          </button>
          {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.13em] text-[#6c857a]">
            <tr>
              <th className="pb-3">Patient</th>
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Chief Complaint</th>
              <th className="pb-3">Assessment</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {encounters.map((encounter) => (
              <tr key={encounter.id} className="border-t border-[var(--line)]">
                <td className="py-3 font-semibold text-[#19382b]">{encounter.patientName}</td>
                <td className="py-3 text-[#33473d]">{encounter.doctorName}</td>
                <td className="py-3 text-[#33473d]">{encounter.chiefComplaint || "-"}</td>
                <td className="py-3 text-[#33473d]">{encounter.assessment || "-"}</td>
                <td className="py-3 text-[#33473d]">{encounter.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}