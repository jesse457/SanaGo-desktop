import React, { useState, useEffect, ReactElement } from "react";
import {
  ClipboardCheck,
  Clock,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  WifiOff,
  Activity,
  Loader2,
  PlayCircle,
  FlaskConical,
} from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";

// --- TYPES ---

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  patient_uid: string;
}

interface LabTestDefinition {
  id: number;
  test_name: string;
  code: string;
  price: number;
}

// Matches the "Select" optimization in the backend
interface LabRequest {
  id: number;
  patient_id: number;
  requested_by_doctor_id: number;
  lab_test_definition_id: number;
  urgency_level: "normal" | "high" | "critical";
  request_date: string;
  status: "requested" | "In_Progress" | "completed" | "cancelled";

  // Relations (Only the selected columns)
  patient?: Patient;
  test_definition?: LabTestDefinition;
  doctor?: User;
}

// Matches the optimized backend response (counts instead of full arrays)
interface DashboardResponse {
  pending_lab_requests: LabRequest[];
  completed_tests_count: number; // Integer from backend
  in_progress_count: number; // Integer from backend
}

interface Response {
  success : boolean
  data: DashboardResponse

}
interface KpiCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: ReactElement;
  color: string;
  bg: string;
  animate?: boolean;
}

const LabDashboard: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [profileOpen, setProfileOpen] = useState(false);

  // --- DATA FETCHING USING CUSTOM HOOK ---
  const {
    data: dashboardData,
    isLoading, // True only until cache loads or first fetch completes
    isSyncing, // True whenever a background network request is active
    refetch,   // Function to manually trigger a sync
  } = useOfflineSync<Response>({
    key: "lab-dashboard-data",
    fetchFn: async () => {
      // The backend returns: { pending_lab_requests: [...], completed_tests_count: 12, in_progress_count: 5 }
      const response = await apiClient.get("/lab-technician/dashboard");
      return response.data;
    },
    autoRefresh: true,
    refreshInterval: 60000, // Refresh every 1 minute
  });

  // Action: Start a Request
  const handleStartRequest = async (id: number) => {
    try {
      // 1. Send the command to the API
      await apiClient.patch(`/lab-technician/lab-requests/${id}/start`);
      
      // 2. Immediately trigger a background sync to update the UI
      // This will update the cache and the list without a full page reload
      refetch(); 
    } catch (err) {
      console.error("Failed to start request", err);
    }
  };

  // UI Helper: Monitor Online Status for the Red Banner
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // --- DERIVED DATA ---
  // We use Nullish Coalescing (??) because data might be null initially
  const completedCount = dashboardData?.data.completed_tests_count ?? 0;
  const inProgressCount = dashboardData?.data.in_progress_count ?? 0;
  
  // List data for the table
  const pendingList = dashboardData?.data.pending_lab_requests ?? [];
 
  const pendingCount = pendingList.length;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-zinc-50/50 dark:bg-black">
     
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 mb-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  Lab Dashboard
                </h1>
                {/* Show spinner when hook is syncing in background */}
                {(isSyncing || isLoading) && (
                  <Loader2
                    size={18}
                    className="animate-spin text-indigo-500 mt-1"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`flex h-2 w-2 rounded-full ${isOffline ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`}
                />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {isOffline ? "Offline Mode" : "Node Active"} •{" "}
                  <span className="text-zinc-900 dark:text-zinc-100 uppercase">
                    Technician
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center font-black text-white text-xs border-2 border-white dark:border-zinc-800 shadow-sm">
                LT
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-none">
                  Lab Tech
                </p>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-8 mt-0">
        <KpiCard
          title="Tests Completed"
          value={completedCount}
          sub="Today's Results"
          icon={<ClipboardCheck size={24} />}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          title="In Progress"
          value={inProgressCount}
          sub="Currently Running"
          icon={<FlaskConical size={24} />}
          color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-500/10"
          animate={inProgressCount > 0}
        />
        <KpiCard
          title="Pending Queue"
          value={pendingCount}
          sub="Awaiting Action"
          icon={<Clock size={24} />}
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* QUEUE TABLE */}
      <div className="card-base shadow-xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col m-8 mt-0 bg-white dark:bg-zinc-900 rounded-2xl">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
              Pending Requests
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
              {pendingCount} Samples waiting for analysis
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-all"
          >
            Refresh List <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Patient
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Test Required
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Requested By
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                  Urgency
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {/* Only show full loading state if we have NO data. If we have cached data, show that instead. */}
              {isLoading && !dashboardData ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2
                        className="animate-spin text-zinc-300"
                        size={30}
                      />
                      <span className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">
                        Loading Data...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : pendingList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <p className="text-xs font-black uppercase text-zinc-400 tracking-widest">
                      No pending requests
                    </p>
                    <p className="text-[10px] text-zinc-300 mt-1">
                      The queue is currently empty.
                    </p>
                  </td>
                </tr>
              ) : (
                pendingList.map((req) => (
                  <tr
                    key={req.id}
                    className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors duration-200"
                  >
                    {/* PATIENT COLUMN */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center font-black text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          {req.patient?.first_name?.[0] || "?"}
                          {req.patient?.last_name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                            {req.patient?.first_name} {req.patient?.last_name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight font-mono">
                            #{req.patient?.patient_uid}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* TEST DEFINITION COLUMN */}
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          {req.test_definition?.test_name || "Unknown Test"}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5">
                          Code: {req.test_definition?.code}
                        </span>
                      </div>
                    </td>

                    {/* DOCTOR COLUMN */}
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-tighter">
                        Dr. {req.doctor?.last_name || "Unknown"}
                      </p>
                    </td>

                    {/* URGENCY BADGES */}
                    <td className="px-8 py-5 text-center">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-1.5 ${
                          req.urgency_level === "critical"
                            ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                            : req.urgency_level === "high"
                              ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                              : "bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
                        }`}
                      >
                        {req.urgency_level === "critical" && (
                          <Activity size={10} />
                        )}
                        {req.urgency_level || "Normal"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleStartRequest(req.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
                        >
                          <PlayCircle size={12} /> Start
                        </button>
                        <button className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <MoreHorizontal size={18} />
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
    </div>
  );
};

/* --- KPI CARD COMPONENT --- */
const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  sub,
  icon,
  color,
  bg,
  animate,
}) => (
  <div className="card-base p-6 shadow-xl border-zinc-200/60 dark:border-zinc-800 group hover:scale-[1.02] transition-all duration-300 cursor-default bg-white dark:bg-zinc-900 rounded-2xl">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
          {title}
        </p>
        <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
          {value}
        </h3>
        <p
          className={`text-[10px] font-black uppercase tracking-widest mt-2 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}
        >
          {sub}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} border border-transparent group-hover:border-current transition-all duration-500 ${
          animate ? "animate-pulse" : ""
        }`}
      >
        {icon}
      </div>
    </div>
  </div>
);

export default LabDashboard;