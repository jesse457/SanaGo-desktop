import React, { useState } from "react";
import {
  Search,
  Calendar,
  Eye,
  Loader2,
  FileDown,
  AlertCircle,
  WifiOff,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";

// --- TYPES ---
interface LabResult {
  id: number;
  result_date: string;
  status: string;
  lab_request: {
    id: number;
    patient: {
      first_name: string;
      last_name: string;
      patient_uid: string;
    };
    test_definition: {
      test_name: string;
    };
  };
}

interface PaginatedResponse {
  data: LabResult[];
  total: number;
}

const LabResultsHistory: React.FC = () => {
  // 1. FILTERS STATE
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // 2. API INTEGRATION (useOfflineSync)
  const { 
    data: resultsData, 
    isLoading, 
    isSyncing, 
    error 
  } = useOfflineSync<PaginatedResponse>({
    key: `lab-results-history-${search}-${dateFilter}`,
    fetchFn: async () => {
      const response = await apiClient.get("/lab-technician/lab-results", {
        params: {
          search: search,
          date: dateFilter,
        }
      });
      return response.data.data;
    },
    autoRefresh: true,
    refreshInterval: 60000, // Refresh results every minute
  });

  // 3. ACTIONS
  const handleDownload = async (resultId: number) => {
    try {
      // Endpoint: GET /lab-results/{labResult}/download
      const response = await apiClient.get(`/lab-technician/lab-results/${resultId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Result-${resultId}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const results = resultsData?.data || [];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[{ label: "Laboratory" }, { label: "Diagnostic Records" }]}
            />
            <div className="flex items-center gap-3 mt-2">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Diagnostic Records
                </h1>
                {isSyncing && <Loader2 size={18} className="animate-spin text-indigo-500 mt-1" />}
            </div>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Browse completed test records and patient diagnostic history.
            </p>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[280px] group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by Patient Name, UID, or Test Type..."
              className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Calendar className="text-zinc-400" size={14} />
            <input
              type="date"
              className="bg-transparent text-[10px] font-black uppercase tracking-tight outline-none dark:[color-scheme:dark]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(search || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
              }}
              className="px-5 h-11 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </header>

      {/* ERROR STATE */}
      {error && (
        <div className="m-6 p-4 bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <AlertCircle size={18} />
            <p className="text-xs font-black uppercase tracking-widest">Failed to sync latest records</p>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto app-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Patient</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Test Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Completed Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-zinc-300 mx-auto" size={32} />
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-xs font-black uppercase text-zinc-400 tracking-widest">
                    No matching diagnostic records found
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-black text-indigo-600 text-xs border border-indigo-100 dark:border-indigo-800 uppercase">
                          {res.lab_request.patient.first_name[0]}{res.lab_request.patient.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                            {res.lab_request.patient.first_name} {res.lab_request.patient.last_name}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                            {res.lab_request.patient.patient_uid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                        {res.lab_request.test_definition.test_name}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                        {new Date(res.result_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                        {new Date(res.result_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        res.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleDownload(res.id)}
                            className="p-2 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Download PDF"
                        >
                            <FileDown size={18} />
                        </button>
                        <Link 
                            to={`/laboratory/enter-results/${res.lab_request.id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 dark:border-indigo-800 transition-all hover:bg-indigo-600 hover:text-white"
                        >
                            <Eye size={14} /> View Details
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

export default LabResultsHistory;