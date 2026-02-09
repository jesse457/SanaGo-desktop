import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  CalendarDays,
  CheckCircle2,
  Eye,
  Loader2,
  ClipboardList,
  X,
  WifiOff,
  RefreshCcw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { storageService } from "../../services/StorageService";

// --- Interfaces ---
interface AdmissionRequest {
  id: number;
  status: string;
  reason: string;
  doctor: { name: string };
}

interface PatientRecord {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  patient_uid: string;
  is_admitted_approve: boolean;
  current_admission?: {
    status: string;
    admission_date: string;
  };
}

const PatientAdmissions = () => {
  const navigate = useNavigate();

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [patients, setPatients] = useState<PatientRecord[]>([]);

  const [search, setSearch] = useState("");
  const [showAdmittedOnly, setShowAdmittedOnly] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(
    null,
  );
  const [pendingRequests, setPendingRequests] = useState<AdmissionRequest[]>(
    [],
  );
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null,
  );

  // --- API Functions ---
  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/receptionist/admissions", {
        params: {
          query: search,
          status: showAdmittedOnly ? "Admitted" : "",
        },
      });

      const data = response.data.data;
      setPatients(data);
      setIsOffline(false);

      if (!search) await storageService.save("admissions_list", data);
    } catch (error) {
      const cached =
        await storageService.get<PatientRecord[]>("admissions_list");
      if (cached) {
        setPatients(cached);
        setIsOffline(true);
        toast.warning("Offline Mode: Showing cached records.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchAdmissions(), 500);
    return () => clearTimeout(timer);
  }, [search, showAdmittedOnly]);

  const handleOpenAdmitModal = async (patient: PatientRecord) => {
    if (!patient.is_admitted_approve) {
      return toast.error(
        "Action Blocked: A doctor must approve admission first.",
      );
    }

    setSelectedPatient(patient);
    setProcessing(true);

    try {
      const response = await apiClient.get(
        `/receptionist/patients/${patient.id}/admissions`,
      );
      const requests = response.data.data.filter(
        (r: any) => r.status === "Pending",
      );

      setPendingRequests(requests);
      if (requests.length > 0) setSelectedRequestId(requests[0].id);
      setShowModal(true);
    } catch (error) {
      toast.error("Failed to fetch admission requests.");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      pending:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      admitted:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      discharged:
        "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700",
    };
    return map[status.toLowerCase()] || map.discharged;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[{ label: "Receptionist" }, { label: "Admissions" }]}
            />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Patient Admissions{" "}
              {isOffline && (
                <WifiOff className="text-rose-500 w-6 h-6 animate-pulse" />
              )}
            </h1>
          </div>
          <button
            onClick={fetchAdmissions}
            className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between text-zinc-900 dark:text-white">
        <div className="relative w-full md:max-w-md group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by UID or Name..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isOffline}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Admitted Only
          </span>
          <button
            onClick={() => setShowAdmittedOnly(!showAdmittedOnly)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAdmittedOnly ? "bg-primary-500" : "bg-zinc-200 dark:bg-zinc-800"}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAdmittedOnly ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      <div className="flex-1 card-base shadow-xl m-4 overflow-hidden relative flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5 text-center">Eligibility</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {loading && patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr
                    key={p.id}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black shadow-lg">
                          {p.first_name?.[0]}
                          {p.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">
                            {p.full_name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">
                            {p.patient_uid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${p.is_admitted_approve ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-400 bg-zinc-100 dark:bg-zinc-800"}`}
                      >
                        {p.is_admitted_approve ? "Approved" : "No Request"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span
                        className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest uppercase flex items-center gap-2 w-fit ${getStatusStyle(p.current_admission?.status || "None")}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full bg-current ${p.current_admission?.status === "Pending" ? "animate-pulse" : ""}`}
                        />
                        {p.current_admission?.status || "New Record"}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-700 dark:text-zinc-300">
                        <CalendarDays size={14} className="text-zinc-400" />
                        {p.current_admission?.admission_date || "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        {p.is_admitted_approve &&
                          p.current_admission?.status !== "Admitted" && (
                            <button
                              onClick={() => handleOpenAdmitModal(p)}
                              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase rounded-xl"
                            >
                              <Plus size={14} /> Admit
                            </button>
                          )}
                        <button
                          onClick={() =>
                            navigate(`/reception/admission-history/${p.id}`, {
                              state: { patient: p }, // Pass the patient record here
                            })
                          }
                          className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-600 rounded-xl border border-zinc-200 dark:border-zinc-700"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-2xl card-base shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                  Confirm Admission
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Processing:{" "}
                  <span className="text-primary-500 font-bold">
                    {selectedPatient.full_name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 space-y-4 max-h-[50vh] overflow-y-auto">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestId(req.id)}
                  className={`p-6 rounded-2xl border transition-all cursor-pointer ${selectedRequestId === req.id ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <ClipboardList
                      size={20}
                      className={
                        selectedRequestId === req.id
                          ? "text-primary-500"
                          : "text-zinc-500"
                      }
                    />
                    <div>
                      <p
                        className={`text-sm font-black ${selectedRequestId === req.id ? "text-white dark:text-zinc-900" : "text-zinc-900 dark:text-white"}`}
                      >
                        Request #{req.id}
                      </p>
                      <p className="text-[10px] font-black uppercase text-zinc-400">
                        Dr. {req.doctor.name}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`p-4 rounded-xl text-xs italic border ${selectedRequestId === req.id ? "bg-white/10 border-white/20" : "bg-zinc-50 dark:bg-zinc-800"}`}
                  >
                    "{req.reason}"
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-[10px] font-black uppercase text-zinc-400"
              >
                Cancel
              </button>
              <Link
                to={`/reception/admit-patient/${selectedRequestId}`}
                // PASS THE DATA HERE
                state={{
                  patient: selectedPatient,
                  request: pendingRequests.find(
                    (r) => r.id === selectedRequestId,
                  ),
                }}
              >
                <button
                  disabled={!selectedRequestId || isOffline}
                  className="button-primary flex items-center gap-3 py-4 px-10 shadow-xl"
                >
                  <CheckCircle2 size={18} /> <span>Finalize Admission</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAdmissions;
