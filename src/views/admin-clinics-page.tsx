import { useEffect, useState } from "react";
import { SectionPage } from "@/components/section-page";
import {
  fallbackAdminClinics,
  getAdminClinics,
  type ClinicAdminRow,
  type ClinicStatus,
  updateClinicStatus,
} from "@/lib/data/clinic-operations";
import { adminNavigation } from "@/lib/navigation";

export function AdminClinicsPage() {
  const [clinics, setClinics] = useState<ClinicAdminRow[]>(fallbackAdminClinics);
  const [message, setMessage] = useState("");

  async function loadClinics() {
    const result = await getAdminClinics();
    setClinics(result);
  }

  useEffect(() => {
    void loadClinics();
  }, []);

  async function handleStatusChange(clinicId: string, status: ClinicStatus) {
    try {
      await updateClinicStatus(clinicId, status);
      await loadClinics();
      setMessage("Clinic status updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update clinic status.");
    }
  }

  const activeCount = clinics.filter((clinic) => clinic.status === "active").length;
  const graceCount = clinics.filter((clinic) => clinic.status === "grace_period").length;
  const suspendedCount = clinics.filter((clinic) => clinic.status === "suspended").length;

  return (
    <SectionPage
      title="Super Admin"
      subtitle="Subscription control and payment verification center."
      navItems={adminNavigation}
      eyebrow="Clinics"
      heading="Tenant Management and Subscription Control"
      lead="This page is for blocking, unblocking, and monitoring clinics as tenants in the SaaS platform."
      metrics={[
        { label: "Active Clinics", value: String(activeCount), note: "currently live" },
        { label: "Grace Period", value: String(graceCount), note: "need payment follow-up" },
        { label: "Suspended", value: String(suspendedCount), note: "read-only access only" },
      ]}
    >
      {message ? <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[#284238]">{message}</div> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.13em] text-[#6c857a]">
            <tr>
              <th className="pb-3">Clinic</th>
              <th className="pb-3">Code</th>
              <th className="pb-3">Plan</th>
              <th className="pb-3">Billing</th>
              <th className="pb-3">Timezone</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((clinic) => (
              <tr key={clinic.id} className="border-t border-[var(--line)]">
                <td className="py-3 font-semibold text-[#19382b]">{clinic.name}</td>
                <td className="py-3 text-[#33473d]">{clinic.code}</td>
                <td className="py-3 text-[#33473d]">{clinic.plan}</td>
                <td className="py-3 text-[#33473d]">{clinic.amountLabel}</td>
                <td className="py-3 text-[#33473d]">{clinic.timezone}</td>
                <td className="py-3">
                  <select
                    value={clinic.status}
                    onChange={(event) => void handleStatusChange(clinic.id, event.target.value as ClinicStatus)}
                    className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm text-[#33473d] outline-none focus:border-[var(--brand)]"
                  >
                    <option value="active">Active</option>
                    <option value="grace_period">Grace period</option>
                    <option value="suspended">Suspended</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPage>
  );
}