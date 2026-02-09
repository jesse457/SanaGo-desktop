import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sun, Moon, Users, CalendarDays, Beaker, 
  ChevronRight, Clock, Plus, User, Settings, LogOut, Loader2, WifiOff, RefreshCw
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider"; 
import { apiClient } from "../../services/authService";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Import your hook

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================

export interface APIPatient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone_number?: string;
  address?: string;
}

export interface APIAppointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  reason?: string;
  status: string;
  patient: APIPatient;
}

export interface APILabTestDefinition {
  id: number;
  test_name: string;
  test_code: string;
}

export interface APILabRequest {
  id: number;
  patient_id: number;
  priority: string;
  requested_at: string;
  patient: APIPatient;
  test_definition: APILabTestDefinition;
}

export interface APILabResult {
  id: number;
  lab_request_id: number;
  result_date: string;
  findings: string;
  lab_request: APILabRequest;
}

export interface DoctorDashboardData {
  upcoming_appointments: APIAppointment[];
  patients_under_care: APIPatient[];
  incoming_lab_results: APILabResult[];
}

const DASHBOARD_CACHE_KEY = 'doctor_dashboard_cache';

// ==========================================
// 2. HELPER FUNCTIONS
// ==========================================

const getPatientColor = (index: number) => {
  const styles = [
    "bg-blue-100 text-blue-700",
    "bg-indigo-100 text-indigo-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
  ];
  return styles[index % styles.length];
};

const getFullName = (patient?: APIPatient) => {
  if (!patient) return "Unknown Patient";
  return `${patient.first_name} ${patient.last_name}`;
};

const getInitials = (patient?: APIPatient) => {
  if (!patient) return "NA";
  const first = patient.first_name?.charAt(0) || "";
  const last = patient.last_name?.charAt(0) || "";
  return (first + last).toUpperCase();
};

const formatDate = (dateString: string) => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return isNaN(date.getTime()) 
    ? dateString 
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTime = (timeString: string) => {
  return timeString ? timeString.substring(0, 5) : "--:--"; 
};

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // --- A. Define Fetch Function ---
  const fetchDashboardFn = useCallback(async () => {
    const response = await apiClient.get<{ data: DoctorDashboardData }>('/doctor/dashboard');
    return response.data.data;
  }, []);

  // --- B. Use Offline Sync Hook ---
  // This replaces the manual useEffect/storageService logic
  const { 
    data, 
    isLoading, 
    isSyncing, 
    error 
  } = useOfflineSync<DoctorDashboardData>({
    key: DASHBOARD_CACHE_KEY,
    fetchFn: fetchDashboardFn,
    autoRefresh: true,
    refreshInterval: 120000 // 2 minutes
  });

  // --- C. Derived State ---
  const isOfflineMode = !!error; // If hook returns error, we are likely offline (using cache)

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = {
    totalPatients: data?.patients_under_care?.length || 0,
    appointmentsCount: data?.upcoming_appointments?.length || 0,
    labResultsCount: data?.incoming_lab_results?.length || 0
  };

  const kpiConfig = [
    { 
      label: "Patients Under Care", 
      count: stats.totalPatients, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-500/10", 
      border: "group-hover:border-blue-500/50" 
    },
    { 
      label: "Upcoming Appts", 
      count: stats.appointmentsCount, 
      icon: CalendarDays, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50 dark:bg-emerald-500/10", 
      border: "group-hover:border-emerald-500/50" 
    },
    { 
      label: "New Lab Results", 
      count: stats.labResultsCount, 
      icon: Beaker, 
      color: "text-amber-600", 
      bg: "bg-amber-50 dark:bg-amber-500/10", 
      border: "group-hover:border-amber-500/50" 
    },
  ];

  // Only show global loading if we have NO data (no cache, first load)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300`}>
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate flex items-center gap-3">
              Doctor's Portal
              
             
              {isSyncing && !isLoading && (
                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                   <RefreshCw size={10} className="animate-spin" /> Updating
                 </span>
              )}
            </h1>
            <p className="text-xs text-zinc-500 font-medium truncate">
              {greeting}, <span className="text-zinc-900 dark:text-zinc-100 font-bold">Dr. {user?.name || 'Doctor'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 transition-all">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                   {user?.name ? user.name.substring(0,2).toUpperCase() : "DR"}
                </div>
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                   <div className="p-2 space-y-1">
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                        <User size={16} /> <span>My Profile</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                        <Settings size={16} /> <span>Settings</span>
                      </button>
                      <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                      <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors">
                        <LogOut size={16} /> <span>Sign Out</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {kpiConfig.map((item, index) => (
            <div key={index} className={`group bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 ${item.border}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{item.count}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} transition-transform group-hover:scale-110`}>
                  <item.icon size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* APPOINTMENTS LIST */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Upcoming Schedule</h3>
              <button className="text-[10px] font-black text-blue-600 hover:text-blue-700 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-full transition-colors tracking-widest">
                VIEW ALL
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/30">
                    <th className="px-8 py-4">Time</th>
                    <th className="px-8 py-4">Patient</th>
                    <th className="hidden sm:table-cell px-8 py-4">Reason</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {data?.upcoming_appointments && data.upcoming_appointments.length > 0 ? (
                    data.upcoming_appointments.map((appt, i) => (
                      <tr key={appt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                             <Clock size={14} className="text-zinc-400" />
                             {formatTime(appt.appointment_time)}
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${getPatientColor(i)} flex items-center justify-center text-xs font-black shadow-sm`}>
                              {getInitials(appt.patient)}
                            </div>
                            <span className="font-bold text-sm text-zinc-900 dark:text-white">
                              {getFullName(appt.patient)}
                            </span>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-8 py-4 text-xs font-medium text-zinc-500 italic">
                          {appt.reason || "General Consultation"}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-blue-600 transition-colors">
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-8 text-center text-zinc-400 text-sm font-medium">
                        No upcoming appointments.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LAB RESULTS LIST */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Latest Lab Results</h3>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {data?.incoming_lab_results && data.incoming_lab_results.length > 0 ? (
                data.incoming_lab_results.map((result, i) => (
                  <div key={result.id} className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group gap-4">
                    <div className="flex gap-4 items-start sm:items-center">
                      <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                        <Beaker size={20} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">
                            {result.lab_request?.test_definition?.test_name || "Lab Test"}
                          </p>
                          {result.lab_request?.priority === 'urgent' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                        </div>
                        <p className="text-xs font-medium text-zinc-500 mt-0.5">
                          {getFullName(result.lab_request?.patient)} • <span className="text-zinc-400">{formatDate(result.result_date)}</span>
                        </p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-5 py-2.5 text-[10px] font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all tracking-widest">
                      REVIEW
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                   <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No pending lab results</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 flex items-center justify-center transition-all hover:-translate-y-1 active:scale-95 z-40 group">
        <Plus size={28} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
};

export default DoctorDashboard;