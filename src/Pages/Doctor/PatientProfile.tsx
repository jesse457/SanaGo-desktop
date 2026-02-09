import React, { useState, useMemo, useCallback } from "react";
import {
  Cake,
  User,
  Phone,
  LogIn,
  ClipboardList,
  Clock,
  Paperclip,
  Loader2,
  ExternalLink,
  Thermometer,
  Activity,
  UserCheck,
  WifiOff,
  RefreshCw,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../services/authService";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Import your hook

// --- Types (Kept the same) ---
interface Doctor {
  id: number;
  name: string;
}
interface Attachment {
  id: number;
  file_name: string;
  file_type: string;
}
interface MedicalRecord {
  id: number;
  record_type: string;
  created_at: string;
  doctor?: Doctor;
  diagnosis_text?: string;
  complaint?: string;
  treatment_plan?: string;
  general_notes?: string;
  soap_notes?: string;
  attachments?: Attachment[];
}
interface Vital {
  id: number;
  recorded_at: string;
  flag_abnormal?: boolean;
  temperature_celsius?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate_bpm?: number;
  spo2_percentage?: number;
  nurse?: { name: string };
}
interface Admission {
  id: number;
  status: "Pending" | "Admitted" | "Discharged";
}
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  patient_uid: string;
  age: number;
  gender: string;
  phone_number?: string;
  is_admitted_approve?: boolean;
  medical_records?: MedicalRecord[];
  vitals?: Vital[];
  admissions?: Admission[];
}

// --- Helper: Date Grouping ---
const getTimeBucket = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  if (isSameDay(date, now)) return "Today";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (isSameDay(date, yesterday)) return "Yesterday";
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  if (date > oneWeekAgo) return "This Week";
  return "Older Records";
};

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  // 1. Get "Preview Data" passed from the Patient List
  // This allows the Name/Age/Gender to show INSTANTLY while the full profile loads
  const previewData = location.state?.previewData as Patient | undefined;

  const [activeTab, setActiveTab] = useState<"history" | "vitals">("history");
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [previewingId, setPreviewingId] = useState<number | null>(null);

  // 2. Define Fetch Function for Hook
  const fetchProfileFn = useCallback(async () => {
    const res = await apiClient.get<{ data: Patient }>(
      `/doctor/patients/${id}`,
    );
    return res.data.data;
  }, [id]);

  // 3. Use Offline Sync Hook
  const {
    data: fullProfile,
    isLoading,
    isSyncing,
    error,
    refetch,
  } = useOfflineSync<Patient>({
    key: `patient_profile_${id}`, // Unique cache key per patient
    fetchFn: fetchProfileFn,
    autoRefresh: true,
  });

  // 4. Merge Data: Prefer the Full Profile (API/Cache), fallback to Preview Data
  const patient = fullProfile || previewData;
  const isOffline = !!error;

  // Handle Admission Request
  const handleRequestAdmission = async () => {
    if (!patient) return;
    setIsAdmitting(true);
    try {
      await apiClient.post(`/doctor/patients/${patient.id}/admit`);
      toast.success("Admission request sent");
      // Force refresh to get the new status and admission record
      await refetch();
    } catch (err) {
      toast.error("Could not process admission request");
    } finally {
      setIsAdmitting(false);
    }
  };

  const handlePreviewAttachment = async (attId: number) => {
    setPreviewingId(attId);
    try {
      const res = await apiClient.get(`/doctor/attachments/${attId}/preview`);
      window.open(res.data.url, "_blank");
    } catch (err) {
      toast.error("Error generating preview");
    } finally {
      setPreviewingId(null);
    }
  };

  const groupedHistory = useMemo(() => {
    if (!patient?.medical_records) return {};
    return patient.medical_records.reduce<Record<string, MedicalRecord[]>>(
      (acc, record) => {
        const bucket = getTimeBucket(record.created_at);
        if (!acc[bucket]) acc[bucket] = [];
        acc[bucket].push(record);
        return acc;
      },
      {},
    );
  }, [patient]);

  const latestAdmission = patient?.admissions?.[0];

  // Only show full loader if we have NO data at all (not even preview data)
  if (!patient && isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
          Loading Records...
        </p>
      </div>
    );
  }

  if (!patient) return null;

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto app-scrollbar animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "Doctor" },
            { label: "Patients", path: "/doctor/patients" }, // Ensure path is correct
            { label: `${patient.first_name} ${patient.last_name}` },
          ]}
        />

        {/* --- HEADER CARD --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-[1rem] border border-zinc-200 dark:border-zinc-800 p-8 mb-8 mt-4 shadow-sm relative overflow-hidden">
          {/* Background Loading Bar */}
          {(isLoading || isSyncing) && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800">
              <div className="h-full bg-indigo-500 animate-progress origin-left"></div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full">
              <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-500/20 flex-shrink-0">
                {patient.first_name[0]}
                {patient.last_name[0]}
              </div>

              <div className="text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
                    {patient.first_name} {patient.last_name}
                  </h1>

                  {/* Status Badges */}
                  {isOffline && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                      <WifiOff size={10} /> Offline
                    </span>
                  )}
                  {isSyncing && !isLoading && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase animate-pulse">
                      <RefreshCw size={10} className="animate-spin" />{" "}
                      Updating...
                    </span>
                  )}

                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700 uppercase tracking-tighter">
                    {patient.patient_uid}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-6 mt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                    <Cake size={16} /> {patient.age} yrs
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 uppercase">
                    <User size={16} /> {patient.gender}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                    <Phone size={16} /> {patient.phone_number || "No Phone"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {!latestAdmission || latestAdmission.status === "Discharged" ? (
                <button
                  onClick={handleRequestAdmission}
                  disabled={isAdmitting || !patient.is_admitted_approve}
                  className={`px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center gap-3 
                    ${
                      patient.is_admitted_approve
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30"
                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    }`}
                >
                  {isAdmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <LogIn size={16} />
                  )}
                  {patient.is_admitted_approve
                    ? "Request Admission"
                    : "Connect to Request"}
                </button>
              ) : (
                <div
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-black uppercase text-xs tracking-widest ${
                    latestAdmission.status === "Pending"
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  }`}
                >
                  <UserCheck size={16} />
                  {latestAdmission.status === "Pending"
                    ? "Admission Pending"
                    : latestAdmission.status}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-400"
            }`}
          >
            Consultation History
          </button>
          <button
            onClick={() => setActiveTab("vitals")}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === "vitals"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-zinc-400"
            }`}
          >
            Vitals Log
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[400px]">
          {/* Check if full details are loaded before showing empty states */}
          {!fullProfile && isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-zinc-300 animate-spin mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-400">
                Retrieving medical records...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "history" && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {Object.keys(groupedHistory).length > 0 ? (
                    Object.entries(groupedHistory).map(([bucket, records]) => (
                      <div key={bucket}>
                        <div className="flex items-center gap-4 mb-6">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            {bucket}
                          </h3>
                          <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                        <div className="grid gap-4">
                          {records.map((record) => (
                            <div
                              key={record.id}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[1rem] p-6 shadow-sm hover:border-indigo-300 transition-colors"
                            >
                              {/* ... Record UI ... */}
                              <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-indigo-600">
                                    <ClipboardList size={20} />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-zinc-900 dark:text-white capitalize">
                                      {record.record_type.replace("_", " ")}
                                    </h4>
                                    <p className="text-xs font-bold text-zinc-400">
                                      {new Date(
                                        record.created_at,
                                      ).toLocaleDateString()}{" "}
                                      @{" "}
                                      {new Date(
                                        record.created_at,
                                      ).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800 text-[10px] font-black text-zinc-500 uppercase">
                                  Dr. {record.doctor?.name}
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block mb-2">
                                      Diagnosis
                                    </label>
                                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                      {record.diagnosis_text ||
                                        "No diagnosis recorded"}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">
                                      Complaint
                                    </label>
                                    <p className="text-sm font-medium text-zinc-500">
                                      {record.complaint || "N/A"}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block mb-2">
                                      Treatment Plan
                                    </label>
                                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                      {record.treatment_plan ||
                                        "Pending review"}
                                    </p>
                                  </div>
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {/* ADD THIS BUTTON */}
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/doctor/consultation-details/${record.id}`,
                                          {
                                            state: {
                                              consultation: {
                                                ...record,
                                                patient: patient,
                                              },
                                            },
                                          },
                                        )
                                      }
                                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-xl transition-colors"
                                      title="View Full Details"
                                    >
                                      <ExternalLink size={18} />
                                    </button>
                                    {record.attachments?.map((att) => (
                                      <button
                                        key={att.id}
                                        onClick={() =>
                                          handlePreviewAttachment(att.id)
                                        }
                                        disabled={previewingId === att.id}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all"
                                      >
                                        {previewingId === att.id ? (
                                          <Loader2
                                            size={12}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <Paperclip size={12} />
                                        )}
                                        {att.file_name.substring(0, 12)}...
                                        <ExternalLink
                                          size={10}
                                          className="opacity-50"
                                        />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                      <FileText size={48} className="text-zinc-200 mb-4" />
                      <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                        No Medical History Found
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "vitals" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
                  {patient.vitals && patient.vitals.length > 0 ? (
                    patient.vitals.map((v) => (
                      <div
                        key={v.id}
                        className={`bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border-2 transition-all ${v.flag_abnormal ? "border-rose-100 dark:border-rose-900/30" : "border-transparent"}`}
                      >
                        {/* ... Vitals UI (Same as before) ... */}
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl ${v.flag_abnormal ? "bg-rose-100 text-rose-600" : "bg-zinc-100 text-zinc-500"}`}
                            >
                              <Clock size={16} />
                            </div>
                            <span className="text-xs font-black text-zinc-900 dark:text-white">
                              {new Date(v.recorded_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {v.flag_abnormal && (
                            <div className="bg-rose-500 text-white text-[8px] font-black px-2 py-1 rounded-md tracking-tighter">
                              ABNORMAL
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                              <Thermometer size={10} /> Temp
                            </p>
                            <p className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                              {v.temperature_celsius}°C
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                              <Activity size={10} /> BP
                            </p>
                            <p className="text-lg font-black text-zinc-800 dark:text-zinc-100">
                              {v.blood_pressure_systolic}/
                              {v.blood_pressure_diastolic}
                            </p>
                          </div>
                          {/* ... other vitals ... */}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                      <Activity size={48} className="text-zinc-200 mb-4" />
                      <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                        No Vitals Recorded
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
