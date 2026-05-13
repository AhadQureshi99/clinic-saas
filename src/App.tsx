import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AdminPage } from "@/views/admin-page";
import { AdminAuditPage } from "@/views/admin-audit-page";
import { AdminClinicsPage } from "@/views/admin-clinics-page";
import { ClinicAccessPage } from "@/views/clinic-access-page";
import { ClinicAppointmentsPage } from "@/views/clinic-appointments-page";
import { ClinicConsultationPage } from "@/views/clinic-consultation-page";
import { ClinicBillingPage } from "@/views/clinic-billing-page";
import { ClinicDashboardPage } from "@/views/clinic-dashboard-page";
import { ClinicInventoryPage } from "@/views/clinic-inventory-page";
import { ClinicPatientsPage } from "@/views/clinic-patients-page";
import { ClinicSetupPage } from "@/views/clinic-setup-page";
import { ClinicSignupPage } from "@/views/clinic-signup-page";
import { MarketingHomePage } from "@/views/marketing-home-page";
import { getClinicSession } from "@/lib/auth/session";

/** Redirects unauthenticated clinic users to /login. */
function ClinicRoute({ children }: { children: ReactNode }) {
  const session = getClinicSession();
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingHomePage />} />
      <Route path="/login" element={<ClinicAccessPage />} />
      <Route path="/signup" element={<ClinicSignupPage />} />
      <Route path="/clinic/setup" element={<ClinicRoute><ClinicSetupPage /></ClinicRoute>} />
      <Route path="/clinic/dashboard" element={<ClinicRoute><ClinicDashboardPage /></ClinicRoute>} />
      <Route path="/clinic/patients" element={<ClinicRoute><ClinicPatientsPage /></ClinicRoute>} />
      <Route path="/clinic/appointments" element={<ClinicRoute><ClinicAppointmentsPage /></ClinicRoute>} />
      <Route path="/clinic/consultation" element={<ClinicRoute><ClinicConsultationPage /></ClinicRoute>} />
      <Route path="/clinic/billing" element={<ClinicRoute><ClinicBillingPage /></ClinicRoute>} />
      <Route path="/clinic/inventory" element={<ClinicRoute><ClinicInventoryPage /></ClinicRoute>} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/clinics" element={<AdminClinicsPage />} />
      <Route path="/admin/audit" element={<AdminAuditPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}