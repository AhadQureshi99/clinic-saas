import { useEffect, useState } from "react";
import { SectionPage } from "@/components/section-page";
import {
  createAppointment,
  fallbackAppointments,
  fallbackPatients,
  getAppointments,
  getPatients,
  type AppointmentRecord,
  type PatientRecord,
} from "@/lib/data/clinic-operations";
import { clinicNavigation } from "@/lib/navigation";

export function ClinicAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(fallbackAppointments);
  const [patients, setPatients] = useState<PatientRecord[]>(fallbackPatients);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    patientId: fallbackPatients[0]?.id ?? "",
    doctorName: "Dr. Lim",
    queueNo: "",
    appointmentAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    status: "waiting",
  });

  async function loadData() {
    const [appointmentsResult, patientsResult] = await Promise.all([getAppointments(), getPatients()]);
    setAppointments(appointmentsResult);
    setPatients(patientsResult);
    setForm((current) => ({
      ...current,
      patientId: current.patientId || patientsResult[0]?.id || fallbackPatients[0]?.id || "",
    }));
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      await createAppointment({
        patientId: form.patientId,
        doctorName: form.doctorName,
        queueNo: form.queueNo,
        appointmentAt: new Date(form.appointmentAt).toISOString(),
        status: form.status,
      });
      await loadData();
      setMessage("Appointment created successfully.");
      setForm((current) => ({ ...current, queueNo: "" }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create appointment.");
    } finally {
      setSaving(false);
    }
  }

  const waitingCount = appointments.filter((item) => item.status === "waiting").length;
  const noShowCount = appointments.filter((item) => item.status === "cancelled").length;

  return (
    <SectionPage
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      eyebrow="Appointments"
      heading="Scheduling and Queue Control"
      lead="This module is where the front desk manages bookings, walk-ins, queue numbers, and waiting-room flow."
      metrics={[
        { label: "Today Booked", value: String(appointments.length), note: "scheduled for today" },
        { label: "Waiting Now", value: String(waitingCount), note: "live queue view" },
        { label: "Cancelled", value: String(noShowCount), note: "today only" },
      ]}
    >
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-3xl border border-[var(--line)] bg-[var(--surface-muted)] p-5 md:grid-cols-2 xl:grid-cols-5">
        <label className="space-y-2 text-sm xl:col-span-2">
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
          <span className="font-semibold text-[#284238]">Doctor</span>
          <input
            value={form.doctorName}
            onChange={(event) => setForm((current) => ({ ...current, doctorName: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Queue no.</span>
          <input
            value={form.queueNo}
            onChange={(event) => setForm((current) => ({ ...current, queueNo: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
            placeholder="Q-090"
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Status</span>
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          >
            <option value="waiting">Waiting</option>
            <option value="in_consultation">In consultation</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="space-y-2 text-sm xl:col-span-2">
          <span className="font-semibold text-[#284238]">Appointment time</span>
          <input
            type="datetime-local"
            value={form.appointmentAt}
            onChange={(event) => setForm((current) => ({ ...current, appointmentAt: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>
        <div className="flex items-end gap-3 xl:col-span-3">
          <button
            type="submit"
            disabled={saving || !form.patientId}
            className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Create Appointment"}
          </button>
          {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.13em] text-[#6c857a]">
            <tr>
              <th className="pb-3">Time</th>
              <th className="pb-3">Patient</th>
              <th className="pb-3">Doctor</th>
              <th className="pb-3">Queue</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id} className="border-t border-[var(--line)]">
                <td className="py-3 font-semibold text-[#19382b]">
                  {new Intl.DateTimeFormat("en-MY", { timeStyle: "short", dateStyle: "medium" }).format(new Date(appointment.appointmentAt))}
                </td>
                <td className="py-3 text-[#33473d]">{appointment.patientName}</td>
                <td className="py-3 text-[#33473d]">{appointment.doctorName}</td>
                <td className="py-3 text-[#33473d]">{appointment.queueNo || "-"}</td>
                <td className="py-3 text-[#33473d]">{appointment.status.replace("_", " ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}