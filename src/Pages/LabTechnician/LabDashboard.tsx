import React, { useState, useEffect } from "react";
import {
  Beaker,
  ClipboardCheck,
  Clock,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Search,
  Zap,
  MoreHorizontal,
  ArrowUpRight,
  WifiOff,
  Activity,
} from "lucide-react";

const LabDashboard = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  const pendingRequests = [
    {
      id: 1,
      patient: "James Wilson",
      uid: "PT-8821",
      test: "Complete Blood Count",
      doctor: "Dr. House",
      urgency: "Urgent",
    },
    {
      id: 2,
      patient: "Maria Garcia",
      uid: "PT-9042",
      test: "Lipid Profile",
      doctor: "Dr. Sarah",
      urgency: "High",
    },
    {
      id: 3,
      patient: "Robert Chen",
      uid: "PT-7712",
      test: "Urinalysis",
      doctor: "Dr. Mike",
      urgency: "Normal",
    },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 ">
      {/* OFFLINE ALERT */}
      {isOffline && (
        <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] text-center py-2 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-center gap-2">
            <WifiOff size={14} /> System Offline — Results will sync when
            connection is restored
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 mb-4">
       <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
           
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Lab Dashboard
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Node Active •{" "}
                  <span className="text-zinc-900 dark:text-zinc-100 uppercase">
                    Technician Alex
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
           

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-900 flex items-center justify-center font-black text-white text-xs border-2 border-white dark:border-zinc-800 shadow-sm">
                  AR
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-black text-zinc-900 dark:text-zinc-100 leading-none">
                    Alex Rivera
                  </p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                    Technician
                  </p>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-zinc-400 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-8">
        <KpiCard
          title="Tests Completed"
          value="124"
          sub="Today"
          icon={<ClipboardCheck />}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          title="Processing"
          value="08"
          sub="Active Samples"
          icon={<Activity />}
          color="text-indigo-600"
          bg="bg-indigo-50 dark:bg-indigo-500/10"
          animate={true}
        />
        <KpiCard
          title="Pending Queue"
          value="14"
          sub="Needs Attention"
          icon={<Clock />}
          color="text-amber-600"
          bg="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* QUEUE TABLE */}
      <div className="card-base shadow-xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col m-8">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">
              Pending Lab Requests
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
              Diagnostic Queue Management
            </p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 transition-all">
            View All Requests <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Patient
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Test Required
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Requested By
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                  Urgency
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {pendingRequests.map((req) => (
                <tr
                  key={req.id}
                  className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        {req.patient.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                          {req.patient}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                          ID: {req.uid}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 italic">
                      "{req.test}"
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-tighter">
                      Dr. {req.doctor}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span
                      className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        req.urgency === "Urgent"
                          ? "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          : req.urgency === "High"
                          ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                          : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      }`}
                    >
                      {req.urgency}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENT: KPI CARD --- */
const KpiCard = ({ title, value, sub, icon, color, bg, animate }) => (
  <div className="card-base p-6 shadow-xl border-zinc-200/60 dark:border-zinc-800 group hover:scale-[1.02] transition-all cursor-default">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">
          {title}
        </p>
        <h3 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
          {value}
        </h3>
        <p
          className={`text-[10px] font-black uppercase tracking-widest mt-2 ${color}`}
        >
          {sub}
        </p>
      </div>
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color} border border-transparent group-hover:border-current transition-all duration-500 ${
          animate ? "animate-pulse" : ""
        }`}
      >
        {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
      </div>
    </div>
  </div>
);

export default LabDashboard;
