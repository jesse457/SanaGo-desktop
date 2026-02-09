import React, { useState, useRef, useEffect, ElementType } from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  UserPlus,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Bed,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  ChartData,
  ChartOptions
} from "chart.js";

import { useTheme } from "../../providers/ThemeProvider"; 
import { useAuth } from "../../providers/AuthProvider";
import { useSync } from "../../providers/SyncProvider";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// --- UI Interfaces ---
interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: string;
  isUp: boolean;
  icon: ElementType;
  color: string;
  bg: string;
}

interface ProgressItemProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const Overview: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // RxDB Sync Hook
  const { db, isReady, isSyncing } = useSync();

  // --- Local State ---
  const [stats, setStats] = useState<any>(null);
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [chartStats, setChartStats] = useState<{ labels: string[], data: number[] }>({
    labels: [],
    data: []
  });
  
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // --- RxDB Observers ---
  useEffect(() => {
    if (!db || !isReady) {
        console.log("🕒 [Overview] Waiting for Database...");
        return;
    }

    console.group("🚀 [Overview] DB Observers Initialized");
    const subscriptions: any[] = [];

    // 1. Observe Dashboard Stats (Flat Document)
    if (db.dashboard_stats) {
      const statsSub = db.dashboard_stats.findOne().$.subscribe(doc => {
        if (doc) {
            const data = doc.toJSON();
            console.log("📊 [RxDB] Stats Updated:", data);
            setStats(data);
        }
      });
      subscriptions.push(statsSub);
    }

    // 2. Observe Recent Admissions
    if (db.admissions) {
      const admissionsSub = db.admissions
        .find({ selector: {}, sort: [{ updated_at: 'desc' }], limit: 5 })
        .$.subscribe(docs => {
          const data = docs.map(d => d.toJSON());
          console.log("🏥 [RxDB] Admissions Updated:", data);
          setRecentAdmissions(data);
        });
      subscriptions.push(admissionsSub);
    }

    // 3. Observe Recent Patients (Specially for the Graph)
    // We use the 'recent_patients' collection defined in your schema
    if (db.recent_patients) {
        const patientsSub = db.recent_patients.find().$.subscribe(docs => {
            const data = docs.map(d => d.toJSON());
            console.log(`📈 [RxDB] recent_patients count: ${data.length}`);
            processChartData(data);
        });
        subscriptions.push(patientsSub);
    } else {
        console.warn("⚠️ [Overview] recent_patients collection is missing from this role DB");
    }

    console.groupEnd();

    return () => {
        console.log("🔌 [Overview] Cleaning up subscriptions...");
        subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [db, isReady]);

  /**
   * Helper: Takes recent_patients from local DB and groups them by day
   * to create the Line Chart data for the last 7 days.
   */
  const processChartData = (patients: any[]) => {
    const daysToMap = 7;
    const labels: string[] = [];
    const counts: number[] = [];

    // Generate dates for the last 7 days (including today)
    for (let i = daysToMap - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0]; // format: YYYY-MM-DD

      // Filter patients that were created on this specific date
      // Matching Laravel backend's format: '2026-02-09 03:33:00'
      const dailyCount = patients.filter(p => p.created_at && p.created_at.startsWith(dateKey)).length;

      labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
      counts.push(dailyCount);
    }

    console.log("📊 [Logic] Chart Data Processed:", { labels, counts });
    setChartStats({ labels, data: counts });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Log Sync Status for Debugging
  useEffect(() => {
    if (isSyncing) console.log("🔄 [Sync] Background replication running...");
  }, [isSyncing]);

  // --- Chart Configuration ---
  const chartData: ChartData<"line"> = {
    labels: chartStats.labels.length > 0 ? chartStats.labels : ["-", "-", "-", "-", "-", "-"],
    datasets: [
      {
        fill: true,
        label: t("New Registrations"),
        data: chartStats.data.length > 0 ? chartStats.data : [0, 0, 0, 0, 0, 0],
        borderColor: "#6366f1",
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, beginAtZero: true },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: isDark ? "#71717a" : "#94a3b8" },
      },
    },
  };

  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
             <span>Dashboard</span>
             <span className="text-zinc-300">/</span>
             <span className="text-zinc-900 dark:text-zinc-100">Overview</span>
           </div>
           <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
             {t("Welcome back")}, {user?.name}
           </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Live Sync Badge */}
          {isSyncing && (
            <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-md border border-indigo-100 dark:border-indigo-500/20">
               <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-indigo-600 uppercase">Live Sync</span>
            </div>
          )}

          {/* Low Stock Warning from stats collection */}
          {(stats?.low_stock_medications ?? 0) > 0 && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg">
              <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                {t("{{count}} Low Stock", { count: stats?.low_stock_medications })}
              </span>
            </div>
          )}

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

          <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all">
            <Bell size={18} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
            >
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full bg-indigo-100 object-cover"
              />
              <p className="text-xs font-semibold text-zinc-900 dark:text-white hidden sm:block">
                  {user?.name}
              </p>
              <ChevronDown size={14} className={`text-zinc-400 ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
             {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
                    <User size={16} /> <span>{t("My Profile")}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
                    <Settings size={16} /> <span>{t("Settings")}</span>
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                  <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                    <LogOut size={16} /> <span>{t("Sign Out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        
        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                label={t("Total Patients")} 
                value={new Intl.NumberFormat().format(stats?.total_patients || 0)} 
                unit={t("Reg.")} trend="Total" isUp icon={UserPlus} 
                color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-500/10" 
            />
            <StatCard 
                label={t("Today's Appointments")} 
                value={stats?.today_appointments || 0} 
                unit={t("Patients")} trend="Active" isUp icon={Calendar} 
                color="text-blue-600" bg="bg-blue-100 dark:bg-blue-500/10" 
            />
            <StatCard 
                label={t("Pending Admissions")} 
                value={stats?.pending_admissions || 0} 
                unit={t("Queue")} trend="Live" isUp={false} icon={AlertTriangle} 
                color="text-amber-600" bg="bg-amber-100 dark:bg-amber-500/10" 
            />
            <StatCard 
                label={t("Bed Occupancy")} 
                value={stats ? Math.round(((stats.occupied_beds || 0) / (stats.total_beds || 1)) * 100) : 0} 
                unit="%" trend={`${stats?.occupied_beds || 0}/${stats?.total_beds || 0} Beds`} isUp icon={Bed} 
                color="text-purple-600" bg="bg-purple-100 dark:bg-purple-500/10" 
            />
        </div>

        {/* ANALYTICS & PROGRESS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Patient Flow History (Last 7 Days)")}</h3>
                <div className="h-64 w-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Load Capacity")}</h3>
                <div className="space-y-6">
                    <ProgressItem 
                      label="Available Beds"
                      value={(stats?.total_beds || 0) - (stats?.occupied_beds || 0)}
                      max={stats?.total_beds || 1}
                      color="bg-indigo-500" 
                    />
                    <ProgressItem 
                      label="Pending Lab Tests"
                      value={stats?.pending_lab_requests || 0}
                      max={20}
                      color="bg-emerald-500" 
                    />
                     <ProgressItem 
                      label="Pending Prescriptions"
                      value={stats?.pending_prescriptions || 0}
                      max={30}
                      color="bg-amber-500" 
                    />
                </div>
            </div>
        </div>

        {/* RECENT ADMISSIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Recent Admissions")}</h3>
                <div className="space-y-3">
                    {recentAdmissions.map((adm, i) => (
                        <div key={adm.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-10 rounded-full ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{adm.patient_name}</h4>
                                    <p className="text-xs font-medium text-zinc-500">
                                      {adm.bed_number ? `Bed: ${adm.bed_number}` : 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-zinc-400">
                                  {new Date(adm.admission_date || adm.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                    {recentAdmissions.length === 0 && (
                       <div className="text-center py-4 text-zinc-400 text-sm italic">{t("No recent admissions synchronized.")}</div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS (Keep original UI code) ---
const StatCard: React.FC<StatCardProps> = ({ label, value, unit, trend, isUp, icon: Icon, color, bg }) => {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${bg} ${color}`}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${isUp ? 'text-emerald-600' : 'text-zinc-500'}`}>
                        {isUp && <TrendingUp size={12} />} {trend}
                    </div>
                )}
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
            <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
                <span className="text-xs font-semibold text-zinc-400">{unit}</span>
            </div>
        </div>
    );
};

const ProgressItem: React.FC<ProgressItemProps> = ({ label, value, max, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div>
          <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
              <span className="text-xs font-bold text-zinc-900 dark:text-white">{value} / {max}</span>
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div style={{ width: `${Math.min(percentage, 100)}%` }} className={`h-full ${color} transition-all duration-1000`}></div>
          </div>
      </div>
    );
};

export default Overview;