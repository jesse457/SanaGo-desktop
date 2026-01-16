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
  CheckCircle2,
  Loader2,
  CalendarDays,
  WifiOff,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/api/authService";
import { storageService } from "../../services/api/StorageService";

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

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<number | null>(null);

  const selectedAdmission = admissions.find((a) => a.id === selectedAdmissionId);

  // --- Effects ---
  useEffect(() => {
    loadAdmissionData();
  }, [patientId]);

  const loadAdmissionData = async () => {
    setLoading(true);
    const storageKey = `admission_history_${patientId}`;
    
    try {
      // 1. Try API
      const response = await apiClient.get(`/receptionist/patients/${patientId}/admissions`);
      const data = response.data.data;

      setAdmissions(data);
      if (data.length > 0) setSelectedAdmissionId(data[0].id);
      setIsOffline(false);

      // 2. Cache to local encrypted storage
      await storageService.save(storageKey, data);

    } catch (error) {
      console.error("Fetch failed, checking local storage...");
      
      // 3. Offline Fallback
      const cachedData = await storageService.get<Admission[]>(storageKey);
      if (cachedData) {
        setAdmissions(cachedData);
        if (cachedData.length > 0) setSelectedAdmissionId(cachedData[0].id);
        setIsOffline(true);
        toast.warning("Offline Mode: Loading cached history.");
      } else {
        toast.error("Could not load admission history.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async () => {
    if (!selectedAdmission || isOffline) return;
    
    setActionLoading(true);
    try {
      await apiClient.patch(`/receptionist/admissions/${selectedAdmission.id}/discharge`);
      toast.success("Patient discharged successfully.");
      loadAdmissionData(); // Refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Styles ---
  const getStatusStyles = (status: string) => {
    const map: Record<string, string> = {
      admitted: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      discharged: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
      pending: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
    };
    return map[status.toLowerCase()] || map.discharged;
  };

  const labelClasses = "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";
  const detailCardClasses = "bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-5 transition-all hover:border-zinc-300 dark:hover:border-zinc-700";

  if (loading && admissions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-10">
        <div>
          <Breadcrumbs
            items={[
              { label: "Receptionist" },
              { label: "Admissions", path: "/reception/admissions" },
              { label: "History Overview" },
            ]}
          />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
            Admission Overview {isOffline && <WifiOff className="text-rose-500 w-6 h-6" />}
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">
            Detailed view of patient admission history and current status.
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto w-full">
        <div className="card-base shadow-xl overflow-hidden">
          
          {/* Patient Header */}
          <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-xl shadow-lg rotate-2">
                <span className="-rotate-2">
                    {admissions[0]?.patient?.full_name?.charAt(0) || <User />}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                  {admissions[0]?.patient?.full_name || "Unknown Patient"}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md tracking-widest uppercase">
                    {admissions[0]?.patient?.uid}
                  </span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                  <span className="text-xs font-bold text-zinc-500 capitalize">{admissions[0]?.patient?.gender}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            {/* Record Selector */}
            <div className="mb-10 max-w-sm">
              <label className={labelClasses}>Select Admission Record</label>
              <div className="relative">
                <select 
                  value={selectedAdmissionId || ""}
                  onChange={(e) => setSelectedAdmissionId(Number(e.target.value))}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3.5 text-sm font-black text-zinc-900 dark:text-white outline-none appearance-none cursor-pointer"
                >
                  {admissions.map(adm => (
                    <option key={adm.id} value={adm.id}>
                      {adm.admission_date} — {adm.status}
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none" size={18} />
              </div>
            </div>

            {selectedAdmission && (
              <>
                <div className={`mb-10 p-5 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 ${getStatusStyles(selectedAdmission.status)}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/20">
                      <Info size={20} strokeWidth={3} />
                    </div>
                    <span className="font-black text-xl tracking-tighter uppercase">{selectedAdmission.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={detailCardClasses}>
                    <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-200/50 shadow-sm">
                      <Stethoscope size={24} />
                    </div>
                    <div>
                      <label className={labelClasses.replace("ml-1", "ml-0")}>Assigned Doctor</label>
                      <p className="text-base font-black text-zinc-900 dark:text-white mt-1">{selectedAdmission.doctor.name}</p>
                    </div>
                  </div>

                  <div className={detailCardClasses}>
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-200/50 shadow-sm">
                      <Bed size={24} />
                    </div>
                    <div>
                      <label className={labelClasses.replace("ml-1", "ml-0")}>Bed Allocation</label>
                      <p className="text-base font-black text-zinc-900 dark:text-white mt-1">
                        Code {selectedAdmission.bed.code} 
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-3 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                          {selectedAdmission.bed.ward}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className={detailCardClasses}>
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 shadow-sm">
                      <CalendarDays size={24} />
                    </div>
                    <div>
                      <label className={labelClasses.replace("ml-1", "ml-0")}>Admission Date</label>
                      <p className="text-base font-black text-zinc-900 dark:text-white mt-1">{selectedAdmission.admission_date}</p>
                    </div>
                  </div>

                  <div className={detailCardClasses}>
                    <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200/50 shadow-sm">
                      <LogOut size={24} />
                    </div>
                    <div>
                      <label className={labelClasses.replace("ml-1", "ml-0")}>Discharge Date</label>
                      <p className="text-base font-black text-zinc-900 dark:text-white mt-1">{selectedAdmission.discharge_date || "Active Session"}</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/50 shadow-sm">
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        <label className={labelClasses.replace("ml-1", "ml-0")}>Reason for Admission</label>
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
                    className="w-full sm:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} /> Back to List
                  </button>
                  
                  {selectedAdmission.status === "Admitted" && (
                    <button
                      onClick={handleDischarge}
                      disabled={actionLoading || isOffline}
                      className="button-primary w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-10 shadow-xl bg-rose-500 hover:bg-rose-600 border-none active:scale-95 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                      <span>DISCHARGE PATIENT</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionOverview;