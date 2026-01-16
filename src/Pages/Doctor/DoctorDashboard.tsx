import React, { useState, useEffect, useRef } from "react";
import {
  Heart, Sun, Moon, Bell, Search, Plus, 
  Users, CalendarDays, Beaker, ChevronRight, 
  Clock, CheckCircle2, MoreHorizontal, LogOut, 
  User, Settings
} from "lucide-react";

const DoctorDashboard = () => {
  const [isDark, setIsDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Close dropdowns on click outside
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Mock Data
  const kpiData = [
    { label: "Total Patients", count: 42, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10", border: "group-hover:border-blue-500/50" },
    { label: "Appointments", count: 8, icon: CalendarDays, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "group-hover:border-emerald-500/50" },
    { label: "Lab Results", count: 3, icon: Beaker, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10", border: "group-hover:border-amber-500/50" },
  ];

  const appointments = [
    { time: "09:00", name: "Sarah Connor", reason: "Annual Checkup", initials: "SC", color: "bg-blue-100 text-blue-700" },
    { time: "10:30", name: "John Wick", reason: "Shoulder Pain", initials: "JW", color: "bg-indigo-100 text-indigo-700" },
    { time: "11:45", name: "Ellen Ripley", reason: "Follow-up", initials: "ER", color: "bg-emerald-100 text-emerald-700" },
    { time: "14:20", name: "Tony Stark", reason: "Cardiology", initials: "TS", color: "bg-rose-100 text-rose-700" },
  ];

  const labResults = [
    { test: "Complete Blood Count (CBC)", patient: "Bruce Wayne", date: "Oct 24, 2023", urgent: false },
    { test: "Lipid Profile", patient: "Clark Kent", date: "Oct 23, 2023", urgent: true },
    { test: "Thyroid Function", patient: "Diana Prince", date: "Oct 23, 2023", urgent: false },
  ];

  const notifications = [
    { msg: "Lab results ready for Patient #8821", time: "10m ago" },
    { msg: "Meeting with Dr. House rescheduled", time: "1h ago" },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50/50 text-zinc-900'}`}>
      
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          
          <div className="flex items-center gap-4 min-w-0">
          
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
                Doctor's Portal
              </h1>
              <p className="text-xs text-zinc-500 font-medium truncate">
                {greeting}, <span className="text-zinc-900 dark:text-zinc-100 font-bold">Dr. Watson</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                  DW
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
                      <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors">
                        <LogOut size={16} /> <span>Sign Out</span>
                      </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTENT */}
      <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {kpiData.map((item, index) => (
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

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Upcoming Appointments Table */}
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
                  {appointments.map((appt, i) => (
                    <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                           <Clock size={14} className="text-zinc-400" />
                           {appt.time}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${appt.color} flex items-center justify-center text-xs font-black shadow-sm`}>
                            {appt.initials}
                          </div>
                          <span className="font-bold text-sm text-zinc-900 dark:text-white">{appt.name}</span>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-8 py-4 text-xs font-medium text-zinc-500 italic">
                        {appt.reason}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-blue-600 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lab Results List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">Latest Lab Results</h3>
            </div>
            <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {labResults.map((result, i) => (
                <div key={i} className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors group gap-4">
                  <div className="flex gap-4 items-start sm:items-center">
                    <div className={`p-3 rounded-2xl ${result.urgent ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>
                      <Beaker size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{result.test}</p>
                        {result.urgent && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                      </div>
                      <p className="text-xs font-medium text-zinc-500 mt-0.5">
                        {result.patient} • <span className="text-zinc-400">{result.date}</span>
                      </p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto px-5 py-2.5 text-[10px] font-black bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl shadow-lg shadow-zinc-900/10 hover:shadow-zinc-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all tracking-widest">
                    REVIEW
                  </button>
                </div>
              ))}
              {/* Empty state filler for visuals */}
              {labResults.length < 5 && (
                 <div className="p-8 text-center">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">All caught up</p>
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