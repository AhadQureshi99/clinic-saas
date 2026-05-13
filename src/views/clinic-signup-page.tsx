import { useState } from "react";
import { Link } from "react-router-dom";
import { createClinicSignupRequest } from "@/lib/data/onboarding";

export function ClinicSignupPage() {
  const [form, setForm] = useState({
    clinicName: "",
    contactName: "",
    email: "",
    password: "",
    phone: "",
    desiredCode: "",
    branchCount: 1,
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      await createClinicSignupRequest(form);
      setForm({
        clinicName: "",
        contactName: "",
        email: "",
        password: "",
        phone: "",
        desiredCode: "",
        branchCount: 1,
        notes: "",
      });
      setMessage("Clinic application submitted. Access will only be opened after admin approval.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit clinic application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell min-h-screen px-4 py-6 md:px-10 md:py-8">
      <nav className="mx-auto flex h-[60px] w-full max-w-[1120px] items-center justify-between rounded-[14px] border border-[#eeeee9] bg-white px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#1D9E75] text-lg font-semibold text-white">+</div>
          <span className="text-[17px] font-semibold tracking-[-0.3px]">ClinicCloud</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg border border-[#ddd] px-4 py-[7px] text-sm text-[#1a1a18]">
            Log in
          </Link>
          <Link to="/signup" className="rounded-lg bg-[#1D9E75] px-4 py-[7px] text-sm font-medium text-white">
            Sign up
          </Link>
        </div>
      </nav>

      <main className="mx-auto mt-6 grid w-full max-w-[1120px] gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="ui-panel p-8">
          <p className="ui-kicker">Clinic Signup</p>
          <h1 className="ui-title mt-4">
            Request a clinic account the normal SaaS way.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#5d665f]">
            Clinics do not self-activate. Every signup request goes into the admin approval queue before the clinic can log in.
          </p>

          <div className="ui-muted mt-8 space-y-4 p-5 text-sm text-[#3d4841]">
            <div>
              <p className="font-semibold">1. Submit clinic details</p>
              <p className="mt-1 text-[#666e68]">Clinic identity, contact, preferred code, and branch count.</p>
            </div>
            <div>
              <p className="font-semibold">2. Admin reviews request</p>
              <p className="mt-1 text-[#666e68]">The software company approves or rejects onboarding.</p>
            </div>
            <div>
              <p className="font-semibold">3. Clinic receives access</p>
              <p className="mt-1 text-[#666e68]">Only approved clinics can use the login page and open the workspace.</p>
            </div>
          </div>
        </section>

        <section className="ui-panel p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-kicker text-[#7a817b]">Apply Now</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#1a1a18]">Clinic Application</h2>
            </div>
            <Link to="/login" className="text-sm font-semibold text-[#1D9E75]">
              Already approved?
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-[#284238]">Clinic name</span>
              <input
                value={form.clinicName}
                onChange={(event) => setForm((current) => ({ ...current, clinicName: event.target.value }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Contact person</span>
              <input
                value={form.contactName}
                onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))}
                className="w-full rounded-2xl border border-(--line) bg-white px-4 py-3 outline-none focus:border-(--brand)"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Create a secure password (min. 8 chars)"
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Preferred clinic code</span>
              <input
                value={form.desiredCode}
                onChange={(event) => setForm((current) => ({ ...current, desiredCode: event.target.value }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
                placeholder="sentosa-clinic"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Branch count</span>
              <input
                type="number"
                min="1"
                value={form.branchCount}
                onChange={(event) => setForm((current) => ({ ...current, branchCount: Number(event.target.value) || 1 }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>
            <label className="space-y-2 text-sm md:col-span-2">
              <span className="font-semibold text-[#284238]">Notes</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
                placeholder="Tell the admin team what modules you need first."
              />
            </label>
            <div className="md:col-span-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Clinic Application"}
              </button>
              {message ? <p className="text-sm text-[#284238]">{message}</p> : null}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
