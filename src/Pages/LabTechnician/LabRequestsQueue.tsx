import React, { useState } from "react";
import { Search, ChevronRight, Home, PlayCircle, Beaker, User, FlaskConical, PencilLine } from "lucide-react";
import { Link } from "react-router-dom";

const LabRequestsQueue = () => {
  const [statusFilter, setStatusFilter] = useState("");

  const requests = [
    { id: 1, patient: "Alex Rivera", uid: "PT-8821", test: "Lipid Profile", requested: "10:30 AM Today", status: "Pending" },
    { id: 2, patient: "Sarah Miller", uid: "PT-1120", test: "Thyroid Panel", requested: "09:15 AM Today", status: "In_Progress" },
    { id: 3, patient: "Kevin Hart", uid: "PT-4432", test: "Glucose Test", requested: "Yesterday", status: "Completed" },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
         <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 mb-4 text-zinc-400">
              <Home size={12} />
              <ChevronRight size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Workflow Queue</span>
            </nav>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Lab Requests</h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">Monitor incoming requests and process patient samples.</p>
          </div>
        </div>

        {/* FILTERS */}
         <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input type="text" placeholder="Search Patient UID, Name, or Test Name..." className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 transition-all outline-none" />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 text-zinc-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In_Progress">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </header>

      {/* REQUESTS TABLE */}
     <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Patient Details</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ordered Test</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Received</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Current Status</th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {requests.map((req) => (
              <tr key={req.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center font-black text-indigo-600 text-xs border border-indigo-100 dark:border-indigo-800 shadow-sm">
                        {req.patient.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">{req.patient}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{req.uid}</p>
                      </div>
                    </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                    {req.test}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{req.requested}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    req.status === 'Pending' ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                    req.status === 'In_Progress' ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" :
                    "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                  }`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-5 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {req.status === 'Pending' && (
                      <button className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 rounded-xl border border-zinc-200 dark:border-zinc-700" title="Start Processing">
                        <PlayCircle size={18} strokeWidth={2.5} />
                      </button>
                    )}
                    <button className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 ${
                      req.status === 'Completed' ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 shadow-sm" : "bg-indigo-600 text-white shadow-indigo-500/30"
                    }`}>
                      {req.status === 'Completed' ? <><PencilLine size={14} /><Link to={`/laboratory/enter-results/${req.id}`} >Edit</Link></> : <><FlaskConical size={14} /> Process</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LabRequestsQueue;