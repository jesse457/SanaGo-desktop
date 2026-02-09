import React, { useState } from "react";
import {
  Banknote, TrendingUp, Beaker, CalendarDays, ClipboardCheck, 
  Building2, Search, Filter, ArrowUpRight, ArrowDownRight, 
  Download, MoreHorizontal, Bell, ChevronLeft, ChevronRight, Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Adjust path
import { apiClient } from "../../services/authService";

// --- Interfaces (Matching Backend Response) ---

interface RevenueBreakdown {
  medication: number;
  appointment: number;
  lab: number;
  admission: number;
}

interface RevenueStats {
  breakdown: RevenueBreakdown;
  total_revenue: number;
  previous_total_revenue: number;
  growth_percentage: number;
}

interface PatientContribution {
  patient_id: number;
  medications: number;
  appointments: number;
  labs: number;
  admissions: number;
  total_contribution: number;
  patient: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface RevenueApiResponse {
  period: string;
  stats: RevenueStats;
  top_patients: {
    data: PatientContribution[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// --- Helper: Currency Formatter ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-CM', { 
    style: 'decimal', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const RevenueDashboard = () => {
  const { t } = useTranslation();
  
  // State
  const [timePeriod, setTimePeriod] = useState<string>("Month");
  const [page, setPage] = useState<number>(1);

  // --- Data Fetching ---
  const fetchRevenueData = async (): Promise<RevenueApiResponse> => {
    const response = await apiClient.get('/admin/revenue', {
      params: { 
        period: timePeriod.toLowerCase(),
        page: page
      }
    });
    return response.data.data;
  };

  // Use the hook for caching and syncing
  const { data, isLoading, isSyncing } = useOfflineSync<RevenueApiResponse>({
    key: `admin_revenue_${timePeriod.toLowerCase()}_p${page}`,
    fetchFn: fetchRevenueData,
    autoRefresh: true,
  });

  // --- Derived Data for UI ---
  
  const stats = data?.stats;
  const patients = data?.top_patients.data || [];

  // Map API breakdown to the UI Metrics Cards
  const metrics = [
    { 
      title: "Pharmacy & Meds", 
      amount: stats?.breakdown.medication || 0, 
      trend: "Revenue", // Simplified as we don't have per-category growth in this API version
      up: true, 
      icon: Beaker, 
      color: "text-emerald-600", 
      bg: "bg-emerald-100 dark:bg-emerald-500/10" 
    },
    { 
      title: "Consultations", 
      amount: stats?.breakdown.appointment || 0, 
      trend: "Fees", 
      up: true, 
      icon: CalendarDays, 
      color: "text-blue-600", 
      bg: "bg-blue-100 dark:bg-blue-500/10" 
    },
    { 
      title: "Lab Services", 
      amount: stats?.breakdown.lab || 0, 
      trend: "Tests", 
      up: true, 
      icon: ClipboardCheck, 
      color: "text-amber-600", 
      bg: "bg-amber-100 dark:bg-amber-500/10" 
    },
    { 
      title: "In-Patient Care", 
      amount: stats?.breakdown.admission || 0, 
      trend: "Services", 
      up: true, 
      icon: Building2, 
      color: "text-purple-600", 
      bg: "bg-purple-100 dark:bg-purple-500/10" 
    },
  ];

  // Calculate visual height for the "Bar Chart" based on the 4 categories relative to total
  const total = stats?.total_revenue || 1; // avoid divide by zero
  const bars = [
    { h: ((stats?.breakdown.medication || 0) / total) * 100 },
    { h: ((stats?.breakdown.appointment || 0) / total) * 100 },
    { h: ((stats?.breakdown.lab || 0) / total) * 100 },
    { h: ((stats?.breakdown.admission || 0) / total) * 100 },
    // Add some random/static filler for visual balance if needed, or repeat
    { h: 40 }, { h: 60 }, { h: 30 }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen p-6 space-y-6 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
            <span>Financials</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 dark:text-zinc-100">Revenue Analytics</span>
          </div>
          
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Revenue Overview
            </h1>
            {isSyncing && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/20">
                  <Loader2 className="animate-spin" size={10} /> Syncing
              </span>
            )}
            {!isSyncing && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20">
                    Live Data
                </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {["Today", "Week", "Month", "Year"].map((p) => (
              <button
                key={p}
                onClick={() => { setTimePeriod(p); setPage(1); }}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timePeriod === p
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors relative">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN SUMMARY CARD */}
      <div className=" gap-6">
        {/* Total Revenue Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="absolute top-0 right-0 w-full h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-end gap-8 relative z-10">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-500">Gross Collection ({timePeriod})</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-zinc-400">FCFA</span>
                            {isLoading && !data ? (
                                <div className="h-10 w-40 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded"></div>
                            ) : (
                                <h2 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    {formatCurrency(stats?.total_revenue || 0)}
                                </h2>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            (stats?.growth_percentage || 0) >= 0 
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400"
                        }`}>
                            <TrendingUp size={14} className={(stats?.growth_percentage || 0) < 0 ? "rotate-180" : ""} /> 
                            <span>{Math.abs(stats?.growth_percentage || 0).toFixed(1)}% vs last period</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                           Prev: <span className="font-medium text-zinc-600 dark:text-zinc-300">
                                {formatCurrency(stats?.previous_total_revenue || 0)}
                           </span>
                        </p>
                    </div>
                </div>

                {/* Visual Bar Chart (Dynamic Heights) */}
                <div className="flex gap-3 h-24 items-end pb-1">
                    {bars.map((bar, i) => (
                    <div key={i} className="group flex flex-col items-center gap-2">
                        <div 
                        style={{ height: `${Math.max(15, bar.h)}%` }} // Min height 15% for visibility
                        className={`w-3 sm:w-4 rounded-full transition-all duration-500 ${
                            i === 1 // Highlight Appointments
                            ? 'bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                            : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900'
                        }`} 
                        />
                    </div>
                    ))}
                </div>
            </div>
        </div>

       
      </div>

      {/* 3. SUB-METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${m.bg} ${m.color}`}>
                <m.icon size={18} strokeWidth={2.5} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${m.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {m.trend}
              </div>
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">{m.title}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold text-zinc-400">FCFA</span>
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(m.amount)}
                </span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. PATIENTS PAYMENT TABLE */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col flex-1">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Top Contributors</h3>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                className="w-full sm:w-64 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 h-9 rounded-lg pl-9 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400" 
                placeholder="Search patient..." 
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition-colors">
                <Filter size={14} /> <span>Filter</span>
            </button>
            <button className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:text-indigo-600 transition-colors">
                <Download size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-medium text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-6 py-3">Patient Name</th>
                <th className="px-6 py-3">Reference ID</th>
                <th className="px-6 py-3 text-right">Meds</th>
                <th className="px-6 py-3 text-right">Labs</th>
                <th className="px-6 py-3 text-right">Net Total</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading && patients.length === 0 ? (
                 // Loading Skeleton
                 [1, 2, 3].map(n => (
                    <tr key={n}>
                        <td colSpan={6} className="px-6 py-4">
                            <div className="h-6 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-full"></div>
                        </td>
                    </tr>
                 ))
              ) : patients.length > 0 ? (
                patients.map((p, i) => (
                    <tr key={i} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors text-sm">
                    <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                                {p.patient?.name ? p.patient.name.substring(0, 2).toUpperCase() : 'NA'}
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                {p.patient?.name || "Unknown Patient"}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-3">
                        <span className="font-mono text-xs text-zinc-500">
                            #{p.patient_id}
                        </span>
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-500 text-xs">
                        {formatCurrency(p.medications)}
                    </td>
                    <td className="px-6 py-3 text-right text-zinc-500 text-xs">
                        {formatCurrency(p.labs)}
                    </td>
                    <td className="px-6 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(p.total_contribution)}
                    </td>
                    <td className="px-6 py-3">
                        <div className="flex justify-center">
                            <button className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 text-sm">
                        No transactions found for this period.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        {data?.top_patients && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
                <span>
                    Showing {data.top_patients.from || 0} - {data.top_patients.to || 0} of {data.top_patients.total} transactions
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === data.top_patients.last_page}
                        className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;