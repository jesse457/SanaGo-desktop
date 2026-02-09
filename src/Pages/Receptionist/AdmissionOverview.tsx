import React, { useState, useEffect } from "react";
import {
  User,
  FileText,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Bed,
  Stethoscope,
  Info,
  Loader2,
  CalendarDays,
  WifiOff,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import Dropdown from "../../components/Dropdown";
import { apiClient } from "../../services/authService";
// 1. Import the hook
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Adjust path as needed

// --- Interfaces ---
interface Admission {
  id: number;
  admission_date: string;
  discharge_date: string | null;
  status: string;
  reason: string;
  doctor: { name: string };
  bed: { code: string; ward: string };
  patient: {
    full_name: string;
    uid: string;
    gender: string;
  };
}

const AdmissionOverview = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  // --- States ---
  // We only need local state for UI actions (selecting an item, discharging)
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 2. The Hook Implementation
  // This replaces: useState(admissions), useState(loading), useState(isOffline), and the large useEffect
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useOfflineSync<Admission[]>({
    key: `admission_history_${patientId}`,
    fetchFn: async () => {
      const response = await apiClient.get(
        `/receptionist/patients/${patientId}/admissions`
      );
      return response.data.data;
    },
    // Optional: Refresh data every 2 minutes automatically
    autoRefresh: true, 
  });

  // Safe fallback to ensure admissions is always an array
  const admissions = data || [];
  
  // Logic: If we have data BUT also have an error, it means we are viewing Cache (Offline)
  const isOffline = !!error && !!data;

  // 3. Selection Logic
  // When new data arrives, if nothing is selected, select the first one.
  useEffect(() => {
    if (admissions.length > 0 && selectedAdmissionId === null) {
      setSelectedAdmissionId(admissions[0].id);
    }
    // If we are offline, show a toast once
    if (isOffline) {
       toast.warning("Offline Mode: Viewing cached history.");
    }
  }, [admissions, selectedAdmissionId, isOffline]);


  // --- Helper Logic (Unchanged) ---
  const passedPatient = state?.patient;

  const patientHeader = {
    full_name:
      admissions[0]?.patient?.full_name ||
      passedPatient?.full_name ||
      "Loading...",
    uid:
      admissions[0]?.patient?.uid ||
      passedPatient?.patient_uid ||
      passedPatient?.uid ||
      "...",
    gender: admissions[0]?.patient?.gender || passedPatient?.gender || "",
  };

  const selectedAdmission = admissions.find(
    (a) => a.id === selectedAdmissionId,
  );

  const handleDischarge = async () => {
    if (!selectedAdmission || isOffline) return;
    setActionLoading(true);
    try {
      await apiClient.patch(
        `/receptionist/admissions/${selectedAdmission.id}/discharge`,
      );
      toast.success("Patient discharged successfully.");
      refetch(); // Simplified: Just tell the hook to get fresh data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyles = (status: string) => {
    const map: Record<string, string> = {
      admitted:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      discharged:
        "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
      pending:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    };
    return map[status.toLowerCase()] || map.discharged;
  };

  const labelClasses =
    "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";
  
  // --- Render ---

  // Show full-page loader ONLY if we have absolutely no data (passed or fetched)
  if (isLoading && !passedPatient && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Loading Clinical Profile...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admissions", path: "/reception/admissions" },
                { label: "History Overview" },
              ]}
            />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Admission Overview{" "}
              {isOffline && <WifiOff className="text-rose-500 w-6 h-6" />}
            </h1>
          </div>
        </div>
      </header>

      <div className=" mx-auto w-full ">
        <div className="card-base shadow-xl m-4 overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 m-4">
          {/* INSTANT HEADER: Populated from navigate state immediately */}
          <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-black text-xl shadow-lg">
              {patientHeader.full_name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {patientHeader.full_name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md tracking-widest uppercase">
                  {patientHeader.uid}
                </span>
                {patientHeader.gender && (
                  <>
                    <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                    <span className="text-xs font-bold text-zinc-500 capitalize">
                      {patientHeader.gender}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* IN-SECTION LOADER: Shows while records are being fetched, if no data exists yet */}
            {isLoading && !data ? (
              <div className="py-20 flex flex-col items-center justify-center opacity-50">
                <Loader2 className="animate-spin mb-4 text-primary-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Syncing History Records...
                </span>
              </div>
            ) : admissions.length === 0 ? (
              <div className="py-20 text-center">
                <FileText className="mx-auto text-zinc-200 mb-4" size={48} />
                <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
                  No previous admission records found.
                </p>
              </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-2">
                {/* Record Selector */}
                <div className="mb-10 max-w-sm">
                  <label className={labelClasses}>Select Session Record</label>
                  <div className="relative">
                    <Dropdown
                      label={selectedAdmissionId ? admissions.find(adm => adm.id === selectedAdmissionId)?.admission_date + " — " + admissions.find(adm => adm.id === selectedAdmissionId)?.status : "Select Admission"}
                      items={admissions.map((adm) => ({
                        label: `${adm.admission_date} — ${adm.status}`,
                        onClick: () => setSelectedAdmissionId(adm.id)
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {selectedAdmission && (
                  <>
                    <div
                      className={`mb-10 p-5 rounded-2xl border flex items-center justify-between ${getStatusStyles(selectedAdmission.status)}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                          <Info size={20} strokeWidth={3} />
                        </div>
                        <span className="font-black text-xl tracking-tighter uppercase">
                          {selectedAdmission.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <DetailCard
                        icon={<Stethoscope size={24} />}
                        label="Assigned Doctor"
                        value={selectedAdmission.doctor.name}
                        color="sky"
                      />
                      <DetailCard
                        icon={<Bed size={24} />}
                        label="Bed Allocation"
                        value={`Code ${selectedAdmission.bed.code}`}
                        subValue={selectedAdmission.bed.ward}
                        color="purple"
                      />
                      <DetailCard
                        icon={<CalendarDays size={24} />}
                        label="Admission Date"
                        value={selectedAdmission.admission_date}
                        color="emerald"
                      />
                      <DetailCard
                        icon={<LogOut size={24} />}
                        label="Discharge Date"
                        value={
                          selectedAdmission.discharge_date || "Active Session"
                        }
                        color="rose"
                      />

                      <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-start gap-5">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/50 shadow-sm">
                            <FileText size={24} />
                          </div>
                          <div className="flex-1">
                            <label
                              className={labelClasses.replace("ml-1", "ml-0")}
                            >
                              Reason for Admission
                            </label>
                            <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-2 leading-relaxed italic">
                              "{selectedAdmission.reason}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-end items-center gap-4">
                      <button
                        onClick={() => navigate("/reception/admissions")}
                        className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2"
                      >
                        <ArrowLeft size={16} /> Back to List
                      </button>

                      {selectedAdmission.status === "Admitted" && (
                        <button
                          onClick={handleDischarge}
                          disabled={actionLoading || isOffline}
                          className="button-primary w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-10 shadow-xl bg-rose-500 hover:bg-rose-600 border-none active:scale-95 disabled:opacity-50"
                        >
                          {actionLoading ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <LogOut size={20} />
                          )}
                          <span>DISCHARGE PATIENT</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Detail Card Sub-component
const DetailCard = ({ icon, label, value, subValue, color }: any) => {
  const colorMap: any = {
    sky: "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200/50",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/50",
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50",
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-5">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${colorMap[color]}`}
      >
        {icon}
      </div>
      <div>
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">
          {label}
        </label>
        <p className="text-base font-black text-zinc-900 dark:text-white">
          {value}
          {subValue && (
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-3 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
              {subValue}
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AdmissionOverview;