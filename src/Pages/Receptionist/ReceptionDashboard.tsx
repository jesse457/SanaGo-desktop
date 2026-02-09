import React, { useState } from "react";
import {
  Users,
  Clock,
  BadgeCheck,
  Search,
  ChevronDown,
  UserCircle,
  Settings,
  LogOut,
  MoreVertical,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../providers/AuthProvider";
import { apiClient } from "../../services/authService";
// 1. Import the hook
import { useOfflineSync } from "../../hooks/useOfflineSync";

// --- Types ---
interface DashboardStats {
  total_patients: number;
  today_pending: number;
  today_confirmed: number;
}

interface AppointmentPatient {
  id: number;
  full_name: string;
}

interface AppointmentDoctor {
  id: number;
  name: string;
}

interface Appointment {
  id: number;
  time: string;
  status: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
}

// Wrapper interface for the API response
interface DashboardResponse {
  stats: DashboardStats;
  tables: {
    appointments_today: Appointment[];
  };
}

const ReceptionDashboard = () => {
  const { user, logout } = useAuth();
  
  // UI State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 2. The Hook Implementation
  // Replaces: useState(stats), useState(appointments), useState(loading), useEffect()
  const { 
    data, 
    isLoading, 
    error 
  } = useOfflineSync<DashboardResponse>({
    key: "reception_dashboard_main", // Unique key for storage
    fetchFn: async () => {
      const response = await apiClient.get('/receptionist/dashboard');
      return response.data; // Return the whole object { stats, tables }
    },
    autoRefresh: true, // Dashboard needs live data
    refreshInterval: 60000 * 2, // Check every 2 minutes
  });

  // 3. Derived Data (Protect against null data during first load)
  const stats: DashboardStats = data?.stats || {
    total_patients: 0,
    today_pending: 0,
    today_confirmed: 0,
  };

  const allAppointments = data?.tables?.appointments_today || [];
  
  // Simple client-side search filtering
  const filteredAppointments = allAppointments.filter(apt => 
    apt.patient.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If we have an error, we assume we are in offline mode (using cache if available)
  const isOfflineMode = !!error;

  // --- Helpers ---
  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      waiting: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      "in consultation": "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      confirmed: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      canceled: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    };
    return map[status.toLowerCase()] || "bg-zinc-100 text-zinc-500";
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase flex items-center gap-2">
            Reception Hub
            {isOfflineMode && <WifiOff className="text-rose-500 h-5 w-5 animate-pulse" />}
          </h1>
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            {isOfflineMode && <span className="text-rose-500 ml-2"> (OFFLINE MODE)</span>}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-zinc-900 dark:text-white leading-none">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">
                  {user?.role || 'Receptionist'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-white font-bold text-xs">
                {user?.name ? getInitials(user.name) : 'US'}
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Signed in as</p>
                  <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors gap-3">
                    <UserCircle size={16} /> Your Profile
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors gap-3">
                    <Settings size={16} /> Settings
                  </button>
                </div>
                <div className="p-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors gap-3"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Total Patients</p>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white mt-3 tracking-tighter">
                  {/* Show specific loader or the data */}
                  {isLoading && !data ? "..." : stats.total_patients}
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
                <Users size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Pending Today</p>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white mt-3 tracking-tighter">
                  {isLoading && !data ? "..." : stats.today_pending}
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
                <Clock size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Confirmed</p>
                <h3 className="text-4xl font-black text-zinc-900 dark:text-white mt-3 tracking-tighter">
                  {isLoading && !data ? "..." : stats.today_confirmed}
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
                <BadgeCheck size={28} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {/* SCHEDULE TABLE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight uppercase">Today's Schedule</h3>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Manage patient flow</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                type="text" 
                placeholder="Search patient..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">Time Slot</th>
                  <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">Patient Details</th>
                  <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">Physician</th>
                  <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">Status</th>
                  <th className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {/* 
                  Show loading only if we have NO data (not even in cache).
                  Otherwise show the list (even if refreshing in background)
                */}
                {isLoading && !data ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm font-bold text-zinc-500">
                      Loading dashboard data...
                    </td>
                  </tr>
                ) : filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm font-bold text-zinc-500">
                      {searchTerm ? "No matching patients found." : "No appointments scheduled for today."}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-xs font-black text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 w-fit">
                          <Clock size={14} className="text-blue-500" />
                          {apt.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                          {apt.patient.full_name}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">General Checkup</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <UserCircle size={16} className="text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                            {apt.doctor?.name || "Unassigned"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest uppercase ${getStatusStyle(apt.status)}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                         <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <MoreVertical size={18} />
                         </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReceptionDashboard;