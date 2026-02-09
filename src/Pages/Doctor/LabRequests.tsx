import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Trash2,
  ArrowRight,
  Clock,
  Beaker,
  RotateCw,
  WifiOff,
  RefreshCw,
  Globe,
  Database,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import Dropdown from "../../components/Dropdown";
import { apiClient } from "../../services/authService";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Custom Hook
import { useNavigate } from "react-router-dom";

// --- Types matched to Laravel API Resource ---

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  patient_uid: string;
}

interface TestDefinition {
  id: number;
  test_name: string;
  test_code: string;
}

interface LabRequest {
  id: number;
  patient: Patient;
  test_definition: TestDefinition; // Note: Ensure Laravel resource matches this key or 'testDefinition'
  request_date: string; // ISO String
  status: "pending" | "in_progress" | "Completed" | "cancelled";
  urgency: "normal" | "urgent" | "emergency";
}

// Cache Key
const LAB_REQUESTS_KEY = "doctor_lab_requests_cache";

const LabRequests = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 1. UI State
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [remoteResults, setRemoteResults] = useState<LabRequest[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // 2. Fetch "My Recent Requests" (Base Cache)
  const fetchRecentRequestsFn = useCallback(async () => {
    // Fetch a batch of recent requests (e.g., 50) for offline access
    const response = await apiClient.get("/doctor/lab-requests", {
      params: { per_page: 50 }, // Laravel pagination param
    });
    return response.data.data; // Ensure this matches Laravel Pagination structure
  }, []);

  const {
    data: cachedRequests,
    isLoading: isCacheLoading,
    isSyncing,
  } = useOfflineSync<LabRequest[]>({
    key: LAB_REQUESTS_KEY,
    fetchFn: fetchRecentRequestsFn,
    autoRefresh: true,
    refreshInterval: 60000 * 5, // 5 Mins
  });

  // 3. Network Listeners
  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  // 4. Hybrid Search Effect (Debounced)
  useEffect(() => {
    if (!searchInput && !statusFilter) {
      setRemoteResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      // Only search remotely if online and query is meaningful or filtering
      if (isOnline) {
        setIsSearchingRemote(true);
        try {
          const res = await apiClient.get("/doctor/lab-requests", {
            params: {
              search: searchInput,
              status: statusFilter,
              per_page: 50,
            },
          });
          setRemoteResults(res.data.data);
        } catch (err) {
          console.error("Remote search failed", err);
        } finally {
          setIsSearchingRemote(false);
        }
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchInput, statusFilter, isOnline]);

  // 5. Merge & Filter Logic
  const displayRequests = useMemo(() => {
    const baseList = cachedRequests || [];

    // If we have fresh remote results (because of search/filter), use those primarily
    // But if offline, we fall back to filtering the cache locally
    if (isOnline && (searchInput || statusFilter) && remoteResults.length > 0) {
      return remoteResults;
    }

   return baseList.filter((req) => {
    // 1. Safety Check: If patient data is missing entirely for a record
    if (!req.patient) return false;

    // 2. Use optional chaining and fallbacks for string properties
    const firstName = req.patient.first_name || "";
    const lastName = req.patient.last_name || "";
    const fullName = `${firstName} ${lastName}`.toLowerCase();
    
    // This was likely line 132: Added safety fallback to ""
    const uid = (req.patient.patient_uid || "").toLowerCase();
    
    const search = (searchInput || "").toLowerCase();

    const matchesSearch =
      !search || fullName.includes(search) || uid.includes(search);
      
    // 3. Status filter safety
    const matchesStatus = !statusFilter || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
}, [cachedRequests, searchInput, statusFilter, remoteResults, isOnline]);

  // --- Helper: Status Styles ---
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
      default: // pending
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return { date: "--", time: "--" };
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-transparent animate-in fade-in duration-500">
      {/* 1. HEADER SECTION */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 min-w-0">
            <Breadcrumbs
              items={[{ label: "Doctor" }, { label: "Lab Requests" }]}
            />
            <div className="flex items-center gap-3 mt-1">
              <h1 className="heading-1 font-black">Lab Requests</h1>

              {/* Status Badges */}
              {!isOnline && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  <WifiOff size={10} /> Offline
                </span>
              )}
              {isSyncing && !isCacheLoading && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-500 animate-pulse">
                  <RefreshCw size={10} className="animate-spin" /> Syncing
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              Monitor and review diagnostic tests requested for your patients.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Total
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-white">
                {displayRequests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full md:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-base pl-10"
                placeholder={
                  isOnline ? "Search database..." : "Search cached requests..."
                }
              />
              {isSearchingRemote && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <RotateCw className="h-4 w-4 text-indigo-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="relative w-full md:w-48">
              <Dropdown
                label={statusFilter ? (statusFilter === "pending" ? "Pending" : statusFilter === "in_progress" ? "In Progress" : statusFilter === "Completed" ? "Completed" : "Cancelled") : "All Statuses"}
                items={[
                  { label: "All Statuses", onClick: () => setStatusFilter("") },
                  { label: "Pending", onClick: () => setStatusFilter("pending") },
                  { label: "In Progress", onClick: () => setStatusFilter("in_progress") },
                  { label: "Completed", onClick: () => setStatusFilter("Completed") },
                  { label: "Cancelled", onClick: () => setStatusFilter("cancelled") }
                ]}
                className="w-full"
                buttonClassName="input-base text-sm font-medium"
              />
            </div>
          </div>

          {(searchInput || statusFilter) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearchInput("");
                  setStatusFilter("");
                  setRemoteResults([]);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-black uppercase tracking-wide hover:underline transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN TABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
        {/* Loading Initial State */}
        {isCacheLoading && !cachedRequests && (
          <div className="flex justify-center py-20">
            <RotateCw className="animate-spin text-indigo-500 w-8 h-8" />
          </div>
        )}

        <div className="card-base overflow-hidden">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-label">Patient</th>
                    <th className="px-6 py-3 text-left text-label">
                      Test Details
                    </th>
                    <th className="px-6 py-3 text-left text-label">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-label">Status</th>
                    <th className="px-6 py-3 text-right text-label">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {displayRequests.length > 0 ? (
                    displayRequests.map((request) => {
                      const { date, time } = formatDate(request.request_date);
                      const isCompleted = request.status === "Completed";
                      // Check if item is from remote (not in local cache)
                      const isRemote =
                        isOnline &&
                        cachedRequests &&
                        !cachedRequests.find((c) => c.id === request.id);

                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-700 dark:text-primary-300 font-black text-sm shadow-sm">
                                {request.patient.first_name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                  {request.patient.first_name}{" "}
                                  {request.patient.last_name}
                                  {isRemote && (
                                    <Globe
                                      size={10}
                                      className="text-indigo-400"
                                    />
                                  )}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                  ID: {request.patient.patient_uid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-900 dark:text-white font-bold">
                              {request.test_definition?.test_name ||
                                "Unknown Test"}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">
                              {request.test_definition?.test_code || "N/A"}
                              {request.urgency === "urgent" && (
                                <span className="ml-2 text-rose-500 font-black uppercase text-[10px]">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-900 dark:text-white font-bold">
                              {date}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">
                              {time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${getStatusStyles(request.status)}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
                              {request.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                            {isCompleted ? (
                              <button
                                onClick={() =>
                                  navigate(`/doctor/results/${request.id}`)
                                }
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-black flex items-center justify-end gap-1 uppercase tracking-wide ml-auto hover:underline"
                              >
                                View Results <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600 cursor-not-allowed flex items-center justify-end gap-1 italic text-xs">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center bg-zinc-50 dark:bg-zinc-900/50"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-4 mb-3">
                            <Beaker className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                          </div>
                          <h3 className="heading-1 text-base">
                            {searchInput
                              ? "No matching requests"
                              : "No recent requests"}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1 font-medium">
                            {isOnline
                              ? "Try adjusting your filters."
                              : "You are offline. Only showing cached history."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabRequests;
