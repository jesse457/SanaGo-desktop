import React, { useState, useMemo } from "react";
import { Search, ChevronRight, Home, PlayCircle, Beaker, FlaskConical, PencilLine, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import Dropdown from "../../components/Dropdown";
import { apiClient } from "../../services/authService";

// --- TYPES ---
interface LabRequest {
  id: number;
  status: 'Pending' | 'In_Progress' | 'Completed';
  request_date: string | null;
  patient: {
    first_name: string;
    last_name: string;
    patient_uid: string;
  } | null; // Changed to allow null
  test_definition: {
    test_name: string;
  } | null; // Changed to allow null
}

interface PaginatedResponse {
  data: LabRequest[];
  current_page: number;
  last_page: number;
  total: number;
}

const LabRequestsQueue: React.FC = () => {
  // 1. FILTERS STATE
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 2. FETCH DATA WITH FILTERS
  const { 
    data: requestsData, 
    isLoading, 
    isSyncing, 
    refetch 
  } = useOfflineSync<PaginatedResponse>({
    key: `lab-workflow-queue-${search}-${statusFilter}`,
    fetchFn: async () => {
      const response = await apiClient.get("/lab-technician/lab-requests", {
        params: {
          search: search,
          status: statusFilter,
          per_page: 50 
        }
      });
     
      // Safety: ensure we return the nested data structure
      return response.data.data || { data: [], total: 0 };
    },
    autoRefresh: true,
    refreshInterval: 30000, 
  });

  // 3. SAFE DATA ACCESS
  const requests = useMemo(() => requestsData?.data ?? [], [requestsData]);
console.log("Requests Data:", requests.map(r => ({ id: r.id, status: r.status }))); // Debug log
  // 4. ACTIONS
  const handleStartRequest = async (id: number) => {
    try {
      await apiClient.patch(`/lab-technician/lab-requests/${id}/start`);
      refetch(); 
    } catch (err) {
      console.error("Failed to start request", err);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
         <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 mb-4 text-zinc-400">
              <Home size={12} />
              <ChevronRight size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Workflow Queue</span>
            </nav>
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Lab Requests</h1>
                {isSyncing && <Loader2 size={20} className="animate-spin text-indigo-500 mt-1" />}
            </div>
            <p className="text-sm text-zinc-500 mt-2 font-medium">Monitor incoming requests and process patient samples.</p>
          </div>
        </div>

        {/* FILTERS */}
         <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
                type="text" 
                placeholder="Search Patient UID, Name, or Test Name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 transition-all outline-none" 
            />
          </div>

          <Dropdown
            label={statusFilter ? (statusFilter === "Pending" ? "Pending" : statusFilter === "In_Progress" ? "Processing" : "Completed") : "All Statuses"}
            items={[
              { label: "All Statuses", onClick: () => setStatusFilter("") },
              { label: "Pending", onClick: () => setStatusFilter("Pending") },
              { label: "Processing", onClick: () => setStatusFilter("In_Progress") },
              { label: "Completed", onClick: () => setStatusFilter("Completed") }
            ]}
            className="h-11"
            buttonClassName="h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 text-zinc-500"
          />
        </div>
      </header>

      {/* REQUESTS TABLE */}
     <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Patient Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ordered Test</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Received</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <Loader2 className="animate-spin text-zinc-300" size={32} />
                         <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Queue...</span>
                      </div>
                   </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      No matching lab requests found.
                   </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-xs border border-indigo-100 dark:border-indigo-800 shadow-sm">
                            {req.patient?.first_name?.[0] ?? '?'}{req.patient?.last_name?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                                {req.patient?.first_name ?? 'Unknown'} {req.patient?.last_name ?? 'Patient'}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{req.patient?.patient_uid ?? 'N/A'}</p>
                          </div>
                        </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                        {req.test_definition?.test_name ?? 'Undefined Test'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                        {req.request_date ? new Date(req.request_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        req.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                        req.status === 'In_Progress' ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                      }`}>
                        {req.status?.replace('_', ' ') ?? 'Unknown'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        {req.status === 'Pending' && (
                          <button 
                            onClick={() => handleStartRequest(req.id)}
                            className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors" 
                            title="Start Processing"
                          >
                            <PlayCircle size={18} strokeWidth={2.5} />
                          </button>
                        )}
                  <Link 
    // Matches your route: /laboratory/enter-results/:id
    to={req.status === 'Completed' 
        ? `/laboratory/history` // Or a specific result view if you have one
        : `/laboratory/enter-results/${req.id}`
    }
    // PASS DATA TO PREVENT UNDEFINED ERROR
    state={{ request: req }} 
    className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${
        req.status === 'Completed' 
        ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm" 
        : "bg-indigo-600 text-white shadow-indigo-500/30"
    }`}
>
  {req.status === 'Completed' ? (
    <><PencilLine size={14} /> View Results</>
  ) : (
    <><FlaskConical size={14} /> Process</>
  )}
</Link>
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

export default LabRequestsQueue;