import React, { useState, useRef, useEffect, ElementType } from "react";
import { useTranslation } from "react-i18next";
import {
  Banknote,
  UserPlus,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Users,
  Bed,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Activity,
  Clock,
  LucideIcon
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
import { useTheme } from "../../providers/ThemeProvider"; // Path updated to match your Context

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// --- Define Internal Interfaces ---

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: string;
  isUp: boolean;
  icon: LucideIcon | ElementType;
  color: string;
  bg: string;
}

interface ProgressItemProps {
  label: string;
  value: number;
  color: string;
}

interface AdmissionItem {
  name: string;
  ward: string;
  time: string;
  bg: string;
  lightBg: string;
}

const Overview: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  // --- Profile Dropdown State ---
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  // Type the ref for the div element
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Typed Chart Data ---
  const chartData: ChartData<"line"> = {
    labels: [t("Mon"), t("Tue"), t("Wed"), t("Thu"), t("Fri"), t("Sat"), t("Sun")],
    datasets: [
      {
        fill: true,
        label: t("New Patients"),
        data: [140, 210, 180, 320, 260, 150, 120],
        borderColor: "#6366f1",
        backgroundColor: isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(99, 102, 241, 0.05)",
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false }, 
        tooltip: { mode: 'index', intersect: false } 
    },
    scales: {
      y: { display: false },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11 },
          color: isDark ? "#71717a" : "#94a3b8",
        },
      },
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <div>
           <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
             <span>Dashboard</span>
             <span className="text-zinc-300">/</span>
             <span className="text-zinc-900 dark:text-zinc-100">Overview</span>
           </div>
           <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            {t("Hospital Command Center")}
           </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg">
            <AlertTriangle size={14} className="text-rose-600 dark:text-rose-400" />
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              {t("{{count}} Critical Stock", { count: 12 })}
            </span>
          </div>

          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

          <button className="relative p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-zinc-50 dark:ring-zinc-950" />
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">AD</div>
              <p className="text-xs font-semibold text-zinc-900 dark:text-white hidden sm:block">Admin User</p>
              <ChevronDown size={14} className={`text-zinc-400 ml-1 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
                    <User size={16} /> <span>{t("My Profile")}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg">
                    <Settings size={16} /> <span>{t("Settings")}</span>
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg">
                    <LogOut size={16} /> <span>{t("Sign Out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        
        {/* 2. STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                label={t("Today's Revenue")} 
                value="1,240,500" unit={t("FCFA")} trend="+12.5%" isUp icon={Banknote} 
                color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-500/10" 
            />
            <StatCard 
                label={t("New Admissions")} 
                value="42" unit={t("Patients")} trend="+4 today" isUp icon={UserPlus} 
                color="text-blue-600" bg="bg-blue-100 dark:bg-blue-500/10" 
            />
            <StatCard 
                label={t("Appointments")} 
                value="18" unit={t("Scheduled")} trend="2 pending" isUp={false} icon={Calendar} 
                color="text-amber-600" bg="bg-amber-100 dark:bg-amber-500/10" 
            />
            <StatCard 
                label={t("Occupancy Rate")} 
                value="84%" unit={t("Capacity")} trend="Optimal" isUp icon={Bed} 
                color="text-purple-600" bg="bg-purple-100 dark:bg-purple-500/10" 
            />
        </div>

        {/* 3. ANALYTICS & PERFORMANCE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Patient Flow Analytics")}</h3>
                <div className="h-64 w-full">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Unit Utilization")}</h3>
                <div className="space-y-6">
                    <ProgressItem label={t("Consultation")} value={78} color="bg-indigo-500" />
                    <ProgressItem label={t("Laboratory")} value={45} color="bg-emerald-500" />
                    <ProgressItem label={t("Emergency (ER)")} value={92} color="bg-rose-500" />
                    <ProgressItem label={t("Pharmacy")} value={30} color="bg-amber-500" />
                </div>
            </div>
        </div>

        {/* 4. RECENT ADMISSIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Staff Roster... (Similar structure) */}
             <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-6">{t("Recent Admissions")}</h3>
                <div className="space-y-3">
                    {[
                        { name: "Johnathan Doe", ward: t("ICU - Room 302"), time: t("12 mins ago"), bg: "bg-indigo-500", lightBg: "bg-indigo-50" },
                        { name: "Sarah Smith", ward: t("Ward B - Bed 12"), time: t("45 mins ago"), bg: "bg-emerald-500", lightBg: "bg-emerald-50" },
                    ].map((adm: AdmissionItem, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-10 rounded-full ${adm.bg}`} />
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{adm.name}</h4>
                                    <p className="text-xs font-medium text-zinc-500">{adm.ward}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-medium text-zinc-400">{adm.time}</span>
                                <ChevronRight size={16} className="text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

// --- TYPED SUB-COMPONENTS ---

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, trend, isUp, icon: Icon, color, bg }) => {
    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
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

const ProgressItem: React.FC<ProgressItemProps> = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
            <span className="text-xs font-bold text-zinc-900 dark:text-white">{value}%</span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div style={{ width: `${value}%` }} className={`h-full ${color} transition-all duration-1000`}></div>
        </div>
    </div>
);

export default Overview;