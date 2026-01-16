import React, { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  Package,
  ChevronDown,
  User,
  LogOut,
  Moon,
  Sun,
  ClipboardList,
  Search,
  Check,
  AlertCircle,
  MoreHorizontal,
  ArrowRight
} from "lucide-react";

const PharmacistDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New Prescription", patient: "Alice Cooper", doctor: "Dr. House", time: "10:30 AM", read: false },
    { id: 2, message: "Stock Alert: Amoxicillin", patient: "N/A", doctor: "System", time: "09:15 AM", read: true },
  ]);

  const medications = [
    { id: 1, name: "Amoxicillin", code: "AMX-500", stock: 12, min: 20, status: "Low Stock" },
    { id: 2, name: "Paracetamol", code: "PAR-650", stock: 150, min: 50, status: "Healthy" },
    { id: 3, name: "Lisinopril", code: "LIS-10", stock: 85, min: 30, status: "Healthy" },
    { id: 4, name: "Ibuprofen", code: "IBU-400", stock: 5, min: 15, status: "Low Stock" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`flex flex-col min-h-screen dark:bg-zinc-950 ${isDarkMode ? "dark bg-zinc-950" : "bg-zinc-50"}`}>
      
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Branding/Context */}
          <div className="flex items-center gap-4">
            
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Dashboard
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Welcome back, <span className="text-zinc-900 dark:text-zinc-100">Pharmacist John</span>
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
         

            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-2" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-white text-xs border-2 border-white dark:border-zinc-800 shadow-sm">
                  PJ
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-none">John Doe</p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">Pharmacist</p>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-4 w-56 card-base shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                  <button className="w-full px-6 py-3 text-left text-xs font-black text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3">
                    <User size={16} /> Profile Settings
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                  <button className="w-full px-6 py-3 text-left text-xs font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3">
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto w-full p-8 space-y-8">
        
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard title="Today's Dispensed" value="42" icon={<CheckCircle />} color="text-blue-600" bg="bg-blue-50" />
          <KpiCard title="Pending Review" value="18" icon={<Clock />} color="text-amber-600" bg="bg-amber-50" />
          <KpiCard title="Low Stock Items" value="04" icon={<Package />} color="text-rose-600" bg="bg-rose-50" />
        </div>

        {/* TABLE SECTION */}
        <div className="card-base shadow-xl border-zinc-200/60 dark:border-zinc-800 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Top Sold Medications</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Real-time inventory overview</p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-all">
              View Inventory <ArrowRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Medication</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Current Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Threshold</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                {medications.map((med) => (
                  <tr key={med.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center font-black text-blue-600 text-xs border border-blue-100 dark:border-blue-800">
                          {med.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none">{med.name}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-tight">{med.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-sm text-zinc-700 dark:text-zinc-300">{med.stock}</td>
                    <td className="px-8 py-5 text-right font-bold text-xs text-zinc-400 uppercase tracking-widest">{med.min} Units</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        med.status === "Healthy" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                        : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      }`}>
                        {med.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-5 bg-zinc-50/30 dark:bg-zinc-900/50 border-t border-zinc-50 dark:border-zinc-800 flex justify-between items-center">
             <span className="text-[10px] font-black uppercase tracking-tight text-zinc-400">Showing {medications.length} items</span>
             <div className="flex gap-2">
               <button className="px-4 py-2 text-[10px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-400 opacity-50 cursor-not-allowed">Prev</button>
               <button className="px-4 py-2 text-[10px] font-black uppercase bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-500/20">1</button>
               <button className="px-4 py-2 text-[10px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500">Next</button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- SUB-COMPONENT: KPI CARD --- */
const KpiCard = ({ title, value, icon, color, bg }) => (
  <div className="card-base p-6 shadow-xl border-zinc-200/60 dark:border-zinc-800 group hover:scale-[1.02] transition-all cursor-default">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{title}</p>
        <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} border border-transparent group-hover:border-current transition-all duration-500`}>
        {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
    </div>
  </div>
);

export default PharmacistDashboard;