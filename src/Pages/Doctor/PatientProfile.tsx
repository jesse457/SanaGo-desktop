import React, { useState, useMemo } from "react";
import {
  Cake,
  User,
  Phone,
  LogIn,
  ClipboardList,
  Heart,
  Clock,
  Paperclip,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

// --- Types ---
interface Doctor {
  name: string;
}

interface Attachment {
  id: number;
  file_name: string;
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

interface Patient {
  first_name: string;
  last_name: string;
  patient_uid: string;
  age: number;
  gender: string;
  phone_number?: string;
  is_admitted_approve?: boolean;
  medicalRecords?: MedicalRecord[];
  vitals?: Vital[];
}

interface Admission {
  status: string;
}

interface PatientProfileProps {
  patient: Patient;
  admission?: Admission;
}

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

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  if (date > startOfWeek) return "This Week";

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  if (date > startOfMonth) return "This Month";

  return "Older";
};

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, admission }) => {
  const [activeTab, setActiveTab] = useState("history");
  const [labModal, setLabModal] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);

  const groupedHistory = useMemo<Record<string, MedicalRecord[]>>(() => {
    if (!patient?.medicalRecords) return {};
    return patient.medicalRecords.reduce<Record<string, MedicalRecord[]>>((acc, record) => {
      const bucket = getTimeBucket(record.created_at);
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket]?.push(record);
      return acc;
    }, {});
  }, [patient]);

  const groupedVitals = useMemo<Record<string, Vital[]>>(() => {
    if (!patient?.vitals) return {};
    return patient.vitals.reduce<Record<string, Vital[]>>((acc, vital) => {
      const bucket = getTimeBucket(vital.recorded_at);
      if (!acc[bucket]) acc[bucket] = [];
      acc[bucket]?.push(vital);
      return acc;
    }, {});
  }, [patient]);

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-transparent overflow-y-auto app-scrollbar animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto p-6">
        <Breadcrumbs
          items={[
            { label: "Doctor" },
            { label: "Patients" },
            { label: `${patient?.first_name} ${patient?.last_name}` },
          ]}
        />

        <div className=" p-6 mb-6 mt-4">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 text-2xl font-black text-white shadow-lg shadow-primary-500/20">
                  {patient?.first_name?.charAt(0)}
                  {patient?.last_name?.charAt(0)}
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                  <h1 className="heading-1 text-2xl">
                    {patient?.first_name} {patient?.last_name}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {patient?.patient_uid}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Cake className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium">
                      {patient?.age} years old
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-zinc-400" />
                    <span className="capitalize font-medium">
                      {patient?.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-zinc-400" />
                    <span className="font-medium">
                      {patient?.phone_number || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              {patient?.is_admitted_approve ? (
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide ${admission?.status === "Pending" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"}`}
                >
                  {admission?.status === "Pending"
                    ? "Admission Pending"
                    : "Admitted"}
                </span>
              ) : (
                <button className="button-primary flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Request Admission
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("history")}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === "history"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
            >
              <ClipboardList
                className={`w-5 h-5 mr-2 ${activeTab === "history" ? "text-primary-500" : "text-zinc-400"}`}
              />
              Consultation History
            </button>

            <button
              onClick={() => setActiveTab("vitals")}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === "vitals"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
            >
              <Heart
                className={`w-5 h-5 mr-2 ${activeTab === "vitals" ? "text-primary-500" : "text-zinc-400"}`}
              />
              Vitals
            </button>
          </nav>
        </div>

        <div className="min-h-[400px]">
          {activeTab === "history" && (
            <div className="animate-in fade-in duration-500">
              {Object.keys(groupedHistory).length > 0 ? (
                Object.entries(groupedHistory).map(([bucket, records]) => (
                  <div key={bucket} className="mb-8">
                    <div className="flex items-center mb-4">
                      <span className="text-label">{bucket}</span>
                      <div className="ml-4 h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
                    </div>
                    <div className="space-y-4">
                      {records.map((record) => (
                        <div
                          key={record.id}
                          className="card-base p-5 hover:border-primary-500/30 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-base font-black text-zinc-900 dark:text-white capitalize">
                                {record.record_type.replace("_", " ")}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                                {new Date(record.created_at).toLocaleString(
                                  [],
                                  { dateStyle: "medium", timeStyle: "short" },
                                )}
                              </p>
                            </div>
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                              Dr. {record.doctor?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              {record.diagnosis_text && (
                                <div className="mb-3">
                                  <h5 className="text-label mb-1">Diagnosis</h5>
                                  <p className="text-sm text-zinc-800 dark:text-zinc-200 bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl border border-primary-100 dark:border-primary-800 font-medium">
                                    {record.diagnosis_text}
                                  </p>
                                </div>
                              )}
                              {record.complaint && (
                                <div>
                                  <h5 className="text-label mb-1">Complaint</h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                    {record.complaint}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div>
                              {record.treatment_plan && (
                                <div className="mb-3">
                                  <h5 className="text-label mb-1">
                                    Treatment Plan
                                  </h5>
                                  <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                                    {record.treatment_plan}
                                  </p>
                                </div>
                              )}
                              <h5 className="text-label mb-1">Notes</h5>
                              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium">
                                {record.general_notes ||
                                  record.soap_notes ||
                                  "No notes available"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex gap-2">
                              {record.attachments?.map((att) => (
                                <button
                                  key={att.id}
                                  className="text-xs flex items-center text-zinc-500 hover:text-primary-600 font-medium"
                                >
                                  <Paperclip className="w-3 h-3 mr-1" />{" "}
                                  {att.file_name.substring(0, 15)}...
                                </button>
                              ))}
                            </div>
                            <a
                              href={`/consultation/${record.id}`}
                              className="text-sm font-bold text-primary-600 hover:text-primary-800 flex items-center"
                            >
                              View Details{" "}
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-base p-10 text-center">
                  <FileText className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
                  <h3 className="heading-1 text-base">
                    No consultations found
                  </h3>
                </div>
              )}
            </div>
          )}

          {activeTab === "vitals" && (
            <div className="animate-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patient?.vitals?.map((v) => (
                  <div key={v.id} className="card-base p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center text-sm font-bold text-zinc-900 dark:text-white">
                        <Clock className="w-4 h-4 text-zinc-400 mr-1.5" />
                        {new Date(v.recorded_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      {v.flag_abnormal && (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 uppercase tracking-wide">
                          ABNORMAL
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">Temp</span>
                        <span className="font-black text-zinc-900 dark:text-white">
                          {v.temperature_celsius || "--"} °C
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">BP</span>
                        <span className="font-black text-zinc-900 dark:text-white">
                          {v.blood_pressure_systolic}/
                          {v.blood_pressure_diastolic}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">
                          Heart Rate
                        </span>
                        <span className="font-black text-zinc-900 dark:text-white">
                          {v.heart_rate_bpm || "--"} bpm
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 font-medium">SpO2</span>
                        <span className="font-black text-zinc-900 dark:text-white">
                          {v.spo2_percentage || "--"}%
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 font-medium">
                      Nurse: {v.nurse?.name || "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {labModal && (
        <Modal title="Lab Request" onClose={() => setLabModal(false)}>
          <div className="p-6">Lab Request Content...</div>
        </Modal>
      )}

      {prescriptionModal && (
        <Modal
          title="New Prescription"
          onClose={() => setPrescriptionModal(false)}
        >
          <div className="p-6">Prescription Content...</div>
        </Modal>
      )}
    </div>
  );
};

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-zinc-950/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in">
    <div className="card-base w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
        <h3 className="heading-1 text-lg">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[calc(90vh-64px)] app-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export default PatientProfile;
