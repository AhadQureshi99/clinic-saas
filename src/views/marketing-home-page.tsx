import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createClinicSignupRequest, loginWithEmailPassword } from "@/lib/data/onboarding";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#footer" },
];

const FEATURES = [
  {
    icon: "PR",
    bg: "#E1F5EE",
    title: "Patient registration",
    desc: "MyKad, passport, walk-in and panel patients - fast queue check-in.",
  },
  {
    icon: "AP",
    bg: "#E6F1FB",
    title: "Appointments",
    desc: "Online booking, WhatsApp reminders, and no-show tracking.",
  },
  {
    icon: "BL",
    bg: "#FAEEDA",
    title: "Billing and receipts",
    desc: "Invoice, collect, refund, and panel claim - with e-Invoice export.",
  },
  {
    icon: "RX",
    bg: "#FBEAF0",
    title: "Prescriptions",
    desc: "Drug dispensing, repeat reminders, and inventory alerts.",
  },
  {
    icon: "BI",
    bg: "#EAF3DE",
    title: "Dashboard and reports",
    desc: "Revenue, patient flow, top diagnoses, and inventory at a glance.",
  },
  {
    icon: "MB",
    bg: "#EEEDFE",
    title: "Multi-branch",
    desc: "Separate branches, shared patients, central reporting.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "RM 199",
    period: "/ month",
    desc: "Solo doctor, 1 branch",
    badge: null,
    popular: false,
    features: [
      "Patient and appointment",
      "Basic billing",
      "Prescription and notes",
      "Email support",
    ],
    cta: "Get started",
    ctaPrimary: false,
  },
  {
    name: "Growth",
    price: "RM 499",
    period: "/ month",
    desc: "Up to 3 doctors, 2 branches",
    badge: "Most popular",
    popular: true,
    features: [
      "Everything in Starter",
      "Panel and corporate billing",
      "WhatsApp reminders",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Get started",
    ctaPrimary: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Unlimited doctors and branches",
    badge: null,
    popular: false,
    features: [
      "Everything in Growth",
      "Teleconsultation",
      "AI note drafting",
      "LHDN e-Invoice",
      "Dedicated account manager",
    ],
    cta: "Talk to sales",
    ctaPrimary: false,
  },
];

const STATES = [
  "Selangor",
  "Kuala Lumpur",
  "Johor",
  "Penang",
  "Perak",
  "Kedah",
  "Sabah",
  "Sarawak",
  "Other",
];

const CLINIC_TYPES = ["GP / General", "Dental", "Specialist", "Panel clinic"];

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  clinicName: string;
  desiredCode: string;
  branchCount: string;
  notes: string;
  state: string;
  clinicType: string;
};

export function MarketingHomePage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState<RegisterFormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    clinicName: "",
    desiredCode: "",
    branchCount: "1",
    notes: "",
    state: "Selangor",
    clinicType: "GP / General",
  });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [submittingSignup, setSubmittingSignup] = useState(false);
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const contactName = `${form.firstName} ${form.lastName}`.trim();
    const desiredCode = form.desiredCode.trim() || form.clinicName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const branchCount = Number.parseInt(form.branchCount, 10);

    if (!contactName || !form.email.trim() || !form.phone.trim() || !form.clinicName.trim() || !desiredCode) {
      setSignupMessage("Please complete all required fields before submitting.");
      return;
    }

    if (Number.isNaN(branchCount) || branchCount < 1) {
      setSignupMessage("Branch count must be at least 1.");
      return;
    }

    try {
      setSubmittingSignup(true);
      setSignupMessage("");
      if (!form.password?.trim()) {
        setSignupMessage("Please create a password for your clinic account.");
        return;
      }
      await createClinicSignupRequest({
        clinicName: form.clinicName,
        contactName,
        email: form.email,
        phone: form.phone,
        desiredCode,
        branchCount,
        password: form.password,
        notes: [
          `State: ${form.state}`,
          `Clinic type: ${form.clinicType}`,
          form.notes.trim(),
        ]
          .filter(Boolean)
          .join(" | "),
      });
      setSignupMessage("Application submitted. Admin approval is required before clinic login is enabled.");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        clinicName: "",
        desiredCode: "",
        branchCount: "1",
        notes: "",
        state: "Selangor",
        clinicType: "GP / General",
      });
    } catch (error) {
      setSignupMessage(error instanceof Error ? error.message : "Unable to submit clinic application.");
    } finally {
      setSubmittingSignup(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginMessage("Enter your email and password.");
      return;
    }

    try {
      setSubmittingLogin(true);
      setLoginMessage("");
      const clinic = await loginWithEmailPassword(loginForm.email, loginForm.password);
      setLoginMessage(`Access granted for ${clinic.name}. Redirecting to dashboard...`);
      navigate("/clinic/dashboard");
    } catch (error) {
      setLoginMessage(error instanceof Error ? error.message : "Unable to login to clinic workspace.");
    } finally {
      setSubmittingLogin(false);
    }
  };

  const scrollToForm = () => {
    document.getElementById("register-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1a1a18]" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <nav className="sticky top-0 z-40 border-b border-[#eeeee9] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[60px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#1D9E75] text-lg font-semibold text-white">+</div>
            <span className="text-[17px] font-semibold tracking-[-0.3px]">ClinicCloud</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex items-center rounded-lg border border-[#ddd] px-3 py-1.5 text-sm text-[#1a1a18] md:hidden"
          >
            Menu
          </button>
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="text-sm text-[#666] transition hover:text-[#1a1a18]">
                {link.label}
              </a>
            ))}
            <Link to="/login" className="rounded-lg border border-[#ddd] px-4 py-[7px] text-sm text-[#1a1a18]">
              Log in
            </Link>
            <Link to="/signup" className="rounded-lg border border-[#ddd] px-4 py-[7px] text-sm text-[#1a1a18]">
              Sign up
            </Link>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-[#eeeee9] bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm text-[#666] hover:bg-[#f5f5f2]"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" className="rounded-lg border border-[#ddd] px-3 py-2 text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                Log in
              </Link>
              <Link to="/signup" className="rounded-lg border border-[#ddd] px-3 py-2 text-center text-sm" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-10 px-4 pb-12 pt-12 md:px-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#E1F5EE] px-3 py-1 text-xs font-medium text-[#0F6E56]">
            <span>✓</span>
            <span>PDPA compliant - Malaysia-ready</span>
          </div>
          <h1 className="mb-4 text-[34px] font-semibold leading-[1.15] tracking-[-0.5px] sm:text-[38px]">
            The modern clinic <span className="text-[#1D9E75]">operating system</span>
          </h1>
          <p className="mb-6 text-base leading-7 text-[#555]">
            Fast patient registration, smart billing, prescription tracking, and real-time dashboards - all in one cloud platform built for Malaysian clinics.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToForm}
              className="rounded-[9px] bg-[#1D9E75] px-6 py-[11px] text-[15px] font-medium text-white"
            >
              Register your clinic
            </button>
            <a href="#" className="text-sm text-[#777]">
              Watch a demo
            </a>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
            {["No setup fee", "Cancel anytime", "Data hosted in Malaysia"].map((text) => (
              <div key={text} className="flex items-center gap-1.5 text-[13px] text-[#555]">
                <span className="font-semibold text-[#1D9E75]">✓</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div id="register-section" className="rounded-[14px] border border-[#eeeee9] bg-white p-6 sm:p-8">
          <h2 className="mb-1 text-xl font-semibold">Register your clinic</h2>
          <p className="mb-6 text-[13px] text-[#888]">Apply now. Your clinic can login only after admin approval.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="First name">
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Ahmad" className={inputClassName} />
              </Field>
              <Field label="Last name">
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Razali" className={inputClassName} />
              </Field>
            </div>
            <Field label="Work email">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@clinic.com.my"
                className={inputClassName}
              />
            </Field>
            <Field label="Password">
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a secure password (min. 8 chars)"
                className={inputClassName}
              />
            </Field>
            <Field label="Phone">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+60 12-345 6789"
                className={inputClassName}
              />
            </Field>
            <Field label="Clinic name">
              <input
                name="clinicName"
                value={form.clinicName}
                onChange={handleChange}
                placeholder="Klinik Sejahtera Sdn Bhd"
                className={inputClassName}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Desired clinic code">
                <input
                  name="desiredCode"
                  value={form.desiredCode}
                  onChange={handleChange}
                  placeholder="klinik-sejahtera"
                  className={inputClassName}
                />
              </Field>
              <Field label="Branch count">
                <input
                  name="branchCount"
                  type="number"
                  min={1}
                  value={form.branchCount}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="State">
                <select name="state" value={form.state} onChange={handleChange} className={inputClassName}>
                  {STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
              </Field>
              <Field label="Clinic type">
                <select name="clinicType" value={form.clinicType} onChange={handleChange} className={inputClassName}>
                  {CLINIC_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notes">
              <input name="notes" value={form.notes} onChange={handleChange} placeholder="Modules needed, go-live target, etc." className={inputClassName} />
            </Field>
            <button
              type="submit"
              disabled={submittingSignup}
              className="w-full rounded-[9px] bg-[#1D9E75] px-4 py-3 text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submittingSignup ? "Submitting..." : "Submit clinic application"}
            </button>
            {signupMessage ? <p className="text-sm text-[#2b4a40]">{signupMessage}</p> : null}
            <p className="text-center text-xs text-[#aaa]">
              By registering you agree to our <a href="#" className="text-[#1D9E75]">Terms of Service</a> and{" "}
              <a href="#" className="text-[#1D9E75]">Privacy Policy</a>.
            </p>
          </form>

          <div className="my-6 border-t border-[#eeeee9]" />

          <div>
            <h3 className="text-lg font-semibold">Clinic login</h3>
            <p className="mb-3 mt-1 text-[13px] text-[#888]">Sign in with your registered email and password.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <Field label="Email">
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="clinic@example.com"
                  className={inputClassName}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="••••••••"
                  className={inputClassName}
                />
              </Field>
              <button
                type="submit"
                disabled={submittingLogin}
                className="w-full rounded-[9px] border border-[#ddd] bg-white px-4 py-3 text-[15px] font-medium text-[#1a1a18] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submittingLogin ? "Checking access..." : "Login to clinic workspace"}
              </button>
              {loginMessage ? <p className="text-sm text-[#2b4a40]">{loginMessage}</p> : null}
            </form>
          </div>
        </div>
      </section>

      <hr className="mx-4 border-0 border-t border-[#eeeee9] sm:mx-8" />

      <section id="features" className="mx-auto w-full max-w-[1120px] px-4 py-12 sm:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-semibold tracking-[-0.3px]">Everything your clinic needs</h2>
          <p className="text-[15px] text-[#666]">Built for front desks, doctors, and clinic owners - all in one place</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-[#eeeee9] bg-white p-5">
              <div className="mb-3 flex h-[38px] w-[38px] items-center justify-center rounded-[9px] text-xs font-semibold text-[#1a1a18]" style={{ background: feature.bg }}>
                {feature.icon}
              </div>
              <h3 className="mb-1 text-sm font-semibold">{feature.title}</h3>
              <p className="text-xs leading-6 text-[#777]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-[#F4F4F0] px-4 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-[1120px]">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-semibold tracking-[-0.3px]">Simple monthly pricing</h2>
            <p className="text-[15px] text-[#666]">Start free. Scale as you grow.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className="rounded-[14px] bg-white p-6"
                style={{ border: plan.popular ? "2px solid #1D9E75" : "1px solid #eeeee9" }}
              >
                {plan.badge ? (
                  <div className="mb-2 inline-block rounded-xl bg-[#E1F5EE] px-[10px] py-[3px] text-[11px] font-semibold text-[#0F6E56]">
                    {plan.badge}
                  </div>
                ) : null}
                <div className="text-[15px] font-semibold">{plan.name}</div>
                <div className="my-2 text-[28px] font-bold tracking-[-0.5px]">
                  {plan.price}
                  {plan.period ? <span className="ml-1 text-[13px] font-normal text-[#888]">{plan.period}</span> : null}
                </div>
                <p className="mb-4 text-xs text-[#888]">{plan.desc}</p>
                <ul className="mb-5 flex list-none flex-col gap-[7px] p-0">
                  {plan.features.map((item) => (
                    <li key={item} className="flex items-center gap-1.5 text-[13px] text-[#555]">
                      <span className="text-sm font-bold text-[#1D9E75]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="w-full rounded-lg px-4 py-2 text-sm font-medium"
                  style={{
                    background: plan.ctaPrimary ? "#1D9E75" : "transparent",
                    color: plan.ctaPrimary ? "#fff" : "#1a1a18",
                    border: plan.ctaPrimary ? "none" : "1px solid #ddd",
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="footer" className="border-t border-[#eeeee9] px-4 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-[#aaa]">2026 ClinicCloud Sdn Bhd - Data hosted in Malaysia</p>
          <div className="flex flex-wrap gap-6">
            {["Privacy", "Terms", "Support", "Bahasa Melayu"].map((item) => (
              <a key={item} href="#" className="text-[13px] text-[#aaa]">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[13px] text-[#666]">{label}</label>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-lg border border-[#ddd] bg-white px-[11px] py-2 text-sm text-[#1a1a18] outline-none";