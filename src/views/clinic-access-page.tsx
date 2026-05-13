import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "@/lib/data/onboarding";

export function ClinicAccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const clinic = await loginWithEmailPassword(email, password);
      setMessage(`Access granted for ${clinic.name}. Redirecting to workspace...`);
      navigate("/clinic/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open clinic workspace.");
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
          <Link to="/signup" className="rounded-lg border border-[#ddd] px-4 py-[7px] text-sm text-[#1a1a18]">
            Sign up
          </Link>
          <Link to="/login" className="rounded-lg bg-[#1D9E75] px-4 py-[7px] text-sm font-medium text-white">
            Log in
          </Link>
        </div>
      </nav>

      <main className="mx-auto mt-6 grid w-full max-w-[1120px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="ui-panel p-8">
          <p className="ui-kicker">Clinic Login</p>
          <h1 className="ui-title mt-4">
            Access your clinic workspace with email and password.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#5d665f]">
            Clinics only get access after the signup request is reviewed and approved by the admin team.
          </p>

          <div className="ui-muted mt-8 space-y-3 p-5 text-sm text-[#3d4841]">
            <p className="font-semibold">How access works</p>
            <p>Submit a signup request with your email and password</p>
            <p>Wait for admin to approve your clinic application</p>
            <p>Log in here — each clinic sees only their own data</p>
          </div>
        </section>

        <section className="ui-panel p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="ui-kicker text-[#7a817b]">Secure Entry</p>
              <h2 className="mt-2 text-3xl font-semibold text-[#1a1a18]">Clinic Portal</h2>
            </div>
            <Link to="/signup" className="text-sm font-semibold text-[#1D9E75]">
              Need approval first?
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="clinic@example.com"
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-semibold text-[#284238]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-[#ddd] bg-white px-4 py-3 outline-none focus:border-[#1D9E75]"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#1D9E75] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in to Clinic Workspace"}
            </button>

            {message ? (
              <div className="ui-muted px-4 py-3 text-sm text-[#3d4841]">
                {message}
              </div>
            ) : null}
          </form>
        </section>
      </main>
    </div>
  );
}
