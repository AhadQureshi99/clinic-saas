import { useEffect, useState } from "react";
import { SectionPage } from "@/components/section-page";
import {
  fallbackClinicProfile,
  getClinicProfile,
  type ClinicProfile,
  updateClinicProfile,
} from "@/lib/data/clinic-operations";
import { clinicNavigation } from "@/lib/navigation";

export function ClinicSetupPage() {
  const [profile, setProfile] = useState<ClinicProfile>(fallbackClinicProfile);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    void getClinicProfile().then((result) => {
      if (mounted) {
        setProfile(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      const updatedProfile = await updateClinicProfile(profile);
      setProfile(updatedProfile);
      setMessage("Clinic setup saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save clinic setup.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionPage
      title="Clinic Workspace"
      subtitle="Daily operations for front desk, doctors, and billing."
      navItems={clinicNavigation}
      eyebrow="Setup"
      heading="Clinic Onboarding and Branch Settings"
      lead="Register clinic identity, payment details, printer settings, and staff defaults before going live."
      metrics={[
        { label: "Setup Status", value: profile.name && profile.phone ? "Ready" : "Draft", note: "clinic profile completeness" },
        { label: "Branches", value: "1", note: "single branch for MVP" },
        { label: "Status", value: profile.status.replace("_", " "), note: "subscription access policy" },
      ]}
    >
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-[#284238]">Clinic name</span>
          <input
            value={profile.name}
            onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Clinic code</span>
          <input
            value={profile.code}
            onChange={(event) => setProfile((current) => ({ ...current, code: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Registration no.</span>
          <input
            value={profile.registrationNo}
            onChange={(event) => setProfile((current) => ({ ...current, registrationNo: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Phone</span>
          <input
            value={profile.phone}
            onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Email</span>
          <input
            type="email"
            value={profile.email}
            onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Timezone</span>
          <input
            value={profile.timezone}
            onChange={(event) => setProfile((current) => ({ ...current, timezone: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Default language</span>
          <select
            value={profile.defaultLanguage}
            onChange={(event) => setProfile((current) => ({ ...current, defaultLanguage: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          >
            <option value="en">English</option>
            <option value="ms">Bahasa Melayu</option>
          </select>
        </label>

        <label className="space-y-2 text-sm md:col-span-2">
          <span className="font-semibold text-[#284238]">Address</span>
          <textarea
            value={profile.address}
            onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Bank account name</span>
          <input
            value={profile.bankAccountName}
            onChange={(event) => setProfile((current) => ({ ...current, bankAccountName: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-semibold text-[#284238]">Bank account number</span>
          <input
            value={profile.bankAccountNumber}
            onChange={(event) => setProfile((current) => ({ ...current, bankAccountNumber: event.target.value }))}
            className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 outline-none focus:border-[var(--brand)]"
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Clinic Setup"}
          </button>
          {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
        </div>
      </form>
    </SectionPage>
  );
}