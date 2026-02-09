import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { useTheme } from "./providers/ThemeProvider";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { NotificationProvider } from "./providers/NotificationProvider";
import { SyncProvider } from "./providers/SyncProvider"; // <--- NEW IMPORT

// --- ECHO SETUP ---
import { setupEcho, publicSocket } from "./echo";

// --- COMPONENTS ---
import ProtectedRoute, { getDashboardPath } from "./components/ProtectedRoute";
import DevNavigation from "./components/DevNavigation";
import ContextMenu from "./components/ContextMenu";
import ProfileView from "./components/ProfileView";

// --- LAYOUTS ---
import AdminLayout from "./layouts/AdminLayout";
import DoctorLayout from "./layouts/DoctorLayout";
import ReceptionLayout from "./layouts/ReceptionLayout";
import PharmacistLayout from "./layouts/PharmacistLayout";
import LabTechnicianLayout from "./layouts/LabTechnicianLayout";

// --- PAGES: AUTH ---
import LoginPage from "./Pages/Auth/LoginPage";
import ForgotPasswordPage from "./Pages/Auth/ForgotPassword";
import ResetPasswordPage from "./Pages/Auth/ResetPassword";

// --- PAGES: ADMIN ---
import AdminOverview from "./Pages/Admin/Overview";
import UserManagement from "./Pages/Admin/UserManagement";
import Settings from "./Pages/Admin/Settings";
import ShiftsView from "./Pages/Admin/ShiftsView";
import RevenueDashboard from "./Pages/Admin/RevenueDashboard";
import UserActivities from "./Pages/Admin/UserActivities";
import CreateUser from "./Pages/Admin/CreateUser";

// --- PAGES: RECEPTION ---
import ReceptionDashboard from "./Pages/Receptionist/ReceptionDashboard";
import PatientAdmissions from "./Pages/Receptionist/PatientAdmission";
import AppointmentsView from "./Pages/Receptionist/AppointmentsView";
import PatientManagementView from "./Pages/Receptionist/PatientManagementView";
import BookAppointmentView from "./Pages/Receptionist/BookAppointmentView";
import RegisterPatientView from "./Pages/Receptionist/RegisterPatient";
import AdmissionOverview from "./Pages/Receptionist/AdmissionOverview";
import PatientAdmissionView from "./Pages/Receptionist/AdmitPatient";

// --- PAGES: DOCTOR ---
import DoctorAppointments from "./Pages/Doctor/Appointments";
import PatientList from "./Pages/Doctor/PatientList";
import PatientProfile from "./Pages/Doctor/PatientProfile";
import PatientConsultation from "./Pages/Doctor/PatientConsultation";
import LabRequests from "./Pages/Doctor/LabRequests";
import DoctorDashboard from "./Pages/Doctor/DoctorDashboard";
import ConsultationDetail from "./Pages/Doctor/ConsultationDetail";

// --- PAGES: PHARMACIST ---
import PharmacistDashboard from "./Pages/Pharmacist/PharmacistDashboard";
import DispenseMedications from "./Pages/Pharmacist/DispenseMedications";
import ManageDrugs from "./Pages/Pharmacist/ManageDrugs";
import CreateDrug from "./Pages/Pharmacist/CreateDrug";

// --- PAGES: LABORATORY ---
import LabRequestsQueue from "./Pages/LabTechnician/LabRequestsQueue";
import EnterLabResults from "./Pages/LabTechnician/EnterLabResults";
import LabResultsHistory from "./Pages/LabTechnician/LabResultsHistory";
import ManageLabTests from "./Pages/LabTechnician/ManageLabTests";
import CreateLabTest from "./Pages/LabTechnician/CreateLabTest";
import LabDashboard from "./Pages/LabTechnician/LabDashboard";

// ==========================================
// HELPER: Echo Initializer
// ==========================================
const EchoInitializer = () => {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      setupEcho(token);
    } else if (token == null) {
      publicSocket();
    } else {
      if (window.Echo) {
        window.Echo.disconnect();
      }
    }
  }, [token]);

  return null;
};

// ==========================================
// HELPER: Root Redirect Logic
// ==========================================
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  const { theme } = useTheme();

  return (
    <AuthProvider>
      <SyncProvider> {/* ✅ Added SyncProvider here */}
        <EchoInitializer />
        <NotificationProvider>
          <HashRouter>
            <Toaster
              position="bottom-right"
              richColors
              theme={theme as "light" | "dark" | "system"}
            />

            <ContextMenu />
            <DevNavigation />

            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* ADMIN MODULE */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminOverview />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="users/create" element={<CreateUser />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="shifts" element={<ShiftsView />} />
                  <Route path="revenue" element={<RevenueDashboard />} />
                  <Route path="activities" element={<UserActivities />} />
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="*" element={<ErrorPage node="Admin" />} />
                </Route>
              </Route>

              {/* RECEPTION MODULE */}
              <Route element={<ProtectedRoute allowedRoles={["receptionist"]} />}>
                <Route path="/reception" element={<ReceptionLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ReceptionDashboard />} />
                  <Route path="patients" element={<PatientManagementView />} />
                  <Route path="register-patient" element={<RegisterPatientView />} />
                  <Route path="admissions" element={<PatientAdmissions />} />
                  <Route path="admit-patient/:requestId" element={<PatientAdmissionView />} />
                  <Route path="admission-history/:patientId" element={<AdmissionOverview />} />
                  <Route path="appointments" element={<AppointmentsView />} />
                  <Route path="book-appointment" element={<BookAppointmentView />} />
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="*" element={<ErrorPage node="Reception" />} />
                </Route>
              </Route>

              {/* DOCTOR MODULE */}
              <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
                <Route path="/doctor" element={<DoctorLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DoctorDashboard />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="patients" element={<PatientList />} />
                  <Route path="patients/:id" element={<PatientProfile />} />
                  <Route path="consultation-details/:id" element={<ConsultationDetail />} />
                  <Route path="consultation" element={<PatientConsultation />} />
                  <Route path="labs" element={<LabRequests />} />
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="*" element={<ErrorPage node="Doctor" />} />
                </Route>
              </Route>

              {/* PHARMACIST MODULE */}
              <Route element={<ProtectedRoute allowedRoles={["pharmacist"]} />}>
                <Route path="/pharmacist" element={<PharmacistLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<PharmacistDashboard />} />
                  <Route path="medications" element={<DispenseMedications />} />
                  <Route path="manage-drugs" element={<ManageDrugs />} />
                  <Route path="create-drugs" element={<CreateDrug />} />
                  <Route path="sales-report" element={<PlaceholderComponent title="Sales Reports" />} />
                  <Route path="feedback" element={<PlaceholderComponent title="Feedback System" />} />
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="*" element={<ErrorPage node="Pharmacist" />} />
                </Route>
              </Route>

              {/* LABORATORY MODULE */}
              <Route element={<ProtectedRoute allowedRoles={["lab-technician"]} />}>
                <Route path="/laboratory" element={<LabTechnicianLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<LabDashboard />} />
                  <Route path="requests" element={<LabRequestsQueue />} />
                  <Route path="history" element={<LabResultsHistory />} />
                  <Route path="enter-results/:id" element={<EnterLabResults />} />
                  <Route path="manage-tests" element={<ManageLabTests />} />
                  <Route path="create-test" element={<CreateLabTest />} />
                  <Route path="profile" element={<ProfileView />} />
                  <Route path="*" element={<ErrorPage node="Laboratory" />} />
                </Route>
              </Route>

              {/* ROOT & FALLBACK */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="*" element={<GlobalNotFound />} />
            </Routes>
          </HashRouter>
        </NotificationProvider>
      </SyncProvider>
    </AuthProvider>
  );
}

// --- Helper Components ---
const PlaceholderComponent = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">{title}</h2>
    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-2">Module under development</p>
  </div>
);

const ErrorPage = ({ node }: { node: string }) => (
  <div className="flex flex-col items-center justify-center h-full">
    <div className="p-8 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
      <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-widest">404 — Node Error</h3>
      <p className="text-zinc-500 text-xs font-bold mt-2">Requested path does not exist in the <span className="text-indigo-500">{node}</span> cluster.</p>
    </div>
  </div>
);

const GlobalNotFound = () => (
  <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-white">
    <div className="text-center">
      <h1 className="text-9xl font-black tracking-tighter opacity-20">404</h1>
      <p className="text-xs font-black uppercase tracking-[0.5em] -mt-10 relative z-10">System Protocol Failure</p>
      <button
        onClick={() => (window.location.href = "#/login")}
        className="mt-8 px-6 py-2 bg-white dark:bg-zinc-800 text-black dark:text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
      >
        Reset to Login
      </button>
    </div>
  </div>
);

export default App;