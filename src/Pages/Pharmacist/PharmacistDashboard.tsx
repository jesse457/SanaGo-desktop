import React, { useState, useRef, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Package,
  ChevronDown,
  User,
  LogOut,
  MoreHorizontal,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { authService, apiClient } from "../../services/authService"; // Adjusted path
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";

// --- Interfaces ---
interface DashboardStats {
  prescriptions_dispensed_today: number;
  prescriptions_pending: number;
  drugs_left_in_inventory: number;
}

interface Medication {
  id: number;
  name: string;
  stock_quantity: number;
  safety_threshold: number;
  dosage_unit: string;
  unit_price: string | number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

const PharmacistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch User Profile
  const { data: user } = useOfflineSync({
    key: "user-profile",
    fetchFn: () => authService.fetchUser(),
  });

  // 2. Fetch KPI Statistics
  const { data: stats, isLoading: statsLoading } = useOfflineSync<DashboardStats>({
    key: "pharmacist-stats",
    fetchFn: async () => {
      const res = await apiClient.get("/pharmacist/dashboard");
      return res.data.data;
    },
  });

  // 3. Fetch Medications List
  const { data: medData, isLoading: medsLoading } = useOfflineSync<PaginatedResponse<Medication>>({
    key: `pharmacist-meds-page-${page}`,
    fetchFn: async () => {
      const res = await apiClient.get("/pharmacist/medications", {
        params: { per_page: 5, page: page }
      });
      return res.data.data;
    },
  });

  const handleLogout = async () => {
    await authService.logout();
    navigate("/login");
  };

  const getStockStatus = (stock: number, min: number) => {
    return stock <= min ? "Low Stock" : "Healthy";
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
              Dashboard
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Station: <span className="text-emerald-500">Pharmacy Node 01</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
               <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">{user?.name}</p>
               <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1">Pharmacist</p>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-800 border-2 border-white dark:border-zinc-700 shadow-lg hover:scale-105 transition-all overflow-hidden"
              >
                <span className="text-xs font-black text-white">{user?.name?.substring(0, 2).toUpperCase()}</span>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150">
                  <button className="w-full px-4 py-2.5 text-left text-[11px] font-black text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors uppercase">
                    <User size={14} /> Profile settings
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-[11px] font-black text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors uppercase"
                  >
                    <LogOut size={14} /> Log out session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto w-full p-6 md:p-8 space-y-8">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard 
            title="Today's Dispensed" 
            value={statsLoading ? "..." : stats?.prescriptions_dispensed_today?.toString() || "0"} 
            icon={<CheckCircle size={20} />} 
            accentColor="blue"
          />
          <KpiCard 
            title="Pending Review" 
            value={statsLoading ? "..." : stats?.prescriptions_pending?.toString() || "0"} 
            icon={<Clock size={20} />} 
            accentColor="amber"
          />
          <KpiCard 
            title="Inventory Total" 
            value={statsLoading ? "..." : stats?.drugs_left_in_inventory?.toLocaleString() || "0"} 
            icon={<Package size={20} />} 
            accentColor="emerald"
          />
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-900 dark:text-white">Active Stock Protocol</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">Global inventory ledger</p>
            </div>
            <button 
              onClick={() => navigate('/pharmacist/manage-drugs')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Full Inventory <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {medsLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-zinc-300 dark:text-zinc-700" size={32} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Medication</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Qty</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Min Safe</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {medData?.data.map((med) => (
                    <tr key={med.id} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-all">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-xs border border-blue-100 dark:border-blue-500/20">
                            {med.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{med.name}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{med.dosage_unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-sm text-zinc-700 dark:text-zinc-300">
                        {med.stock_quantity}
                      </td>
                      <td className="px-8 py-4 text-right text-xs font-bold text-zinc-400">
                        {med.safety_threshold}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors",
                          getStockStatus(med.stock_quantity, med.safety_threshold) === "Healthy" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                        )}>
                          {getStockStatus(med.stock_quantity, med.safety_threshold)}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
               Page {medData?.current_page || 1} of {medData?.last_page || 1}
             </span>
             <div className="flex gap-2">
               <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-[10px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-500 disabled:opacity-30 transition-all"
               >
                 Prev
               </button>
               <button 
                disabled={page >= (medData?.last_page || 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-[10px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-500 disabled:opacity-30 transition-all"
               >
                 Next
               </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- SUB-COMPONENT: KPI CARD --- */
interface KpiProps {
  title: string;
  value: string;
  icon: React.ReactElement;
  accentColor: "blue" | "amber" | "emerald";
}

const KpiCard: React.FC<KpiProps> = ({ title, value, icon, accentColor }) => {
  const styles = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all group hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{title}</p>
          <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{value}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300", styles[accentColor])}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;