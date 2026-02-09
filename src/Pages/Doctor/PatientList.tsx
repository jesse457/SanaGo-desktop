import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  RotateCw,
  Phone,
  ArrowRight,
  UserPlus,
  WifiOff,
  RefreshCw,
  Globe,
  Database,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { toast } from "sonner";

// --- Interfaces ---
interface Patient {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  last_visit: string | null;
  profile_picture?: string | null;
}

// Key for the "My Assigned Patients" cache
const MY_PATIENTS_KEY = "doctor_assigned_patients_cache";

const PatientList = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 1. UI State
  const [searchInput, setSearchInput] = useState("");
  const [remoteResults, setRemoteResults] = useState<Patient[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);

  // 2. Fetch "My Assigned Patients" (Base Cache)
  // This is what we show by default and use for offline search
  const fetchMyPatientsFn = useCallback(async () => {
    // Fetch a reasonable limit of assigned patients (e.g., 100)
    const response = await apiClient.get("/doctor/patients", {
      params: { limit: 100 },
    });
    return response.data.data;
  }, []);

  const {
    data: cachedPatients, // This is your offline "Source of Truth"
    isLoading: isCacheLoading,
    isSyncing,
  } = useOfflineSync<Patient[]>({
    key: MY_PATIENTS_KEY,
    fetchFn: fetchMyPatientsFn,
    autoRefresh: true,
    refreshInterval: 60000 * 5, // Refresh every 5 mins
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

  // 4. Hybrid Search Effect
  useEffect(() => {
    // If search is empty, clear remote results
    if (!searchInput) {
      setRemoteResults([]);
      return;
    }

    // Debounce the API call
    const timer = setTimeout(async () => {
      // Only search remotely if online and query is long enough
      if (isOnline && searchInput.length > 2) {
        setIsSearchingRemote(true);
        try {
          const res = await apiClient.get("/doctor/patients", {
            params: { search: searchInput },
          });
          setRemoteResults(res.data.data);
        } catch (err) {
          console.error("Remote search failed", err);
          // Don't show error toast, just fallback to local
        } finally {
          setIsSearchingRemote(false);
        }
      }
    }, 600); // Wait 600ms after typing

    return () => clearTimeout(timer);
  }, [searchInput, isOnline]);

  // 5. Merge & Filter Logic
  const displayPatients = useMemo(() => {
    const baseList = cachedPatients || [];

    // Case A: No Search -> Show cached assigned list
    if (!searchInput) return baseList;

    const lowerQuery = searchInput.toLowerCase();

    // Case B: Local Filter (Instant)
    const localMatches = baseList.filter(
      (p) =>
        p.full_name.toLowerCase().includes(lowerQuery) ||
        p.uid.toLowerCase().includes(lowerQuery) ||
        (p.phone && p.phone.includes(lowerQuery)),
    );

    // Case C: Hybrid Merge
    // If we have remote results, merge them but remove duplicates
    if (remoteResults.length > 0) {
      const combined = [...localMatches];
      remoteResults.forEach((remoteP) => {
        if (!combined.find((localP) => localP.id === remoteP.id)) {
          combined.push(remoteP);
        }
      });
      return combined;
    }

    return localMatches;
  }, [cachedPatients, searchInput, remoteResults]);

  // Helper
  const getAge = (dob: string) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-transparent animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Doctor" }, { label: "Patients" }]} />
            <div className="flex items-center gap-3 mt-1">
              <h1 className="heading-1 font-black flex items-center gap-2">
                My Patients
              </h1>

              {!isOnline && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  <WifiOff size={10} /> Offline Mode
                </span>
              )}
              {isSyncing && !isCacheLoading && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-500 animate-pulse">
                  <RefreshCw size={10} className="animate-spin" /> Updating List
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              View and manage your assigned patients and their clinical history.
            </p>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex gap-4">
          <div className="relative flex-1 max-w-lg group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder={
                isOnline
                  ? "Search assigned or global database..."
                  : "Searching offline cache..."
              }
              className="input-base pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isSearchingRemote && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <RotateCw className="h-4 w-4 text-primary-500 animate-spin" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            {searchInput && displayPatients.length > 0 && (
              <>
                Found {displayPatients.length} result
                {displayPatients.length !== 1 && "s"}
              </>
            )}
          </div>
        </div>
      </header>

      {/* PATIENT LIST */}
      <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
        {/* Loading Initial Cache */}
        {isCacheLoading && !cachedPatients && (
          <div className="flex justify-center pt-20">
            <RotateCw className="animate-spin text-primary-500 w-8 h-8" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayPatients.map((patient) => {
            // Check if this result came from remote (not in local cache)
            const isRemoteResult =
              cachedPatients &&
              !cachedPatients.find((p) => p.id === patient.id);

            return (
              <div
                key={patient.id}
                onClick={() =>
                  navigate(`/doctor/patients/${patient.id}`, {
                    state: { previewData: patient },
                  })
                }
                className="card-base p-0 hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer"
              >
                <div className="p-5 flex-1">
                  {/* Badge for Remote Results */}
                  {isRemoteResult && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                      <Globe size={10} /> Global Search
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                      {patient.profile_picture ? (
                        <img
                          src={patient.profile_picture}
                          className="w-14 h-14 rounded-2xl object-cover border shadow-sm"
                          alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20">
                          {patient.first_name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="heading-1 text-lg truncate group-hover:text-primary-500 transition-colors">
                        {patient.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          {patient.uid}
                        </span>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                          {getAge(patient.dob)} yrs
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-label block mb-1">Phone</span>
                      <span className="block text-xs font-black truncate text-zinc-600 dark:text-zinc-400">
                        {patient.phone || "N/A"}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-label block mb-1">Last Visit</span>
                      <span className="block text-xs font-black text-zinc-700 dark:text-zinc-300 truncate">
                        {patient.last_visit
                          ? new Date(patient.last_visit).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold text-zinc-500">
                    {isRemoteResult ? (
                      <Globe size={14} className="mr-2 opacity-50" />
                    ) : (
                      <Database size={14} className="mr-2 opacity-50" />
                    )}
                    {isRemoteResult ? "From Server" : "From Cache"}
                  </div>
                  <div className="flex items-center text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                    View Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            );
          })}

          {!isCacheLoading && displayPatients.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-4 mb-4">
                <Search className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="heading-1 text-lg">
                {searchInput
                  ? `No matches for "${searchInput}"`
                  : "No patients found"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
                {searchInput
                  ? isOnline
                    ? "Try searching by UID or ensure spelling is correct."
                    : "You are offline. We only searched your cached patients."
                  : "You don't have any patients assigned yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
