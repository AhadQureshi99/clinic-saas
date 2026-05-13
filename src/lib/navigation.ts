export const clinicNavigation = [
  { label: "Setup", to: "/clinic/setup" },
  { label: "Dashboard", to: "/clinic/dashboard" },
  { label: "Patients", to: "/clinic/patients" },
  { label: "Appointments", to: "/clinic/appointments" },
  { label: "Consultation", to: "/clinic/consultation" },
  { label: "Billing", to: "/clinic/billing" },
  { label: "Inventory", to: "/clinic/inventory" },
];

export const adminNavigation = [
  { label: "Overview", to: "/admin" },
  { label: "Clinics", to: "/admin/clinics" },
  { label: "Audit Logs", to: "/admin/audit" },
];

export type NavItem = (typeof clinicNavigation)[number];