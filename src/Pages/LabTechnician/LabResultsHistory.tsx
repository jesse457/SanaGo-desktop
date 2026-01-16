import React, { useState } from "react";
import {
  Search,
  Calendar,
  Trash2,
  Eye,
  ChevronRight,
  Home,
  CheckCircle,
  Beaker,
  User,
  Filter,
  Download,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";

const LabResultsHistory = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const results = [
    {
      id: 1,
      patient: "James Wilson",
      uid: "PT-8821",
      test: "Complete Blood Count",
      date: "Jan 12, 2026",
      time: "10:30 AM",
      status: "Completed",
    },
    {
      id: 2,
      patient: "Maria Garcia",
      uid: "PT-9042",
      test: "Lipid Profile",
      date: "Jan 11, 2026",
      time: "02:15 PM",
      status: "Completed",
    },
    {
      id: 3,
      patient: "Robert Chen",
      uid: "PT-7712",
      test: "Urinalysis",
      date: "Jan 11, 2026",
      time: "09:00 AM",
      status: "In Progress",
    },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[{ label: "Lab Requests" }, { label: "Enter Results" }]}
            />
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
              Diagnostic Records
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Browse completed test records and patient diagnostic history.
            </p>
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[280px] group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by Patient Name, UID, or Test Type..."
              className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 h-11 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Calendar className="text-zinc-400" size={14} />
            <input
              type="date"
              className="bg-transparent text-[10px] font-black uppercase tracking-tight outline-none dark:[color-scheme:dark]"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(search || dateFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setDateFilter("");
              }}
              className="px-5 h-11 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto app-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Patient
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Test Details
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Completed Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {results.map((res) => (
                <tr
                  key={res.id}
                  className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-black text-indigo-600 text-xs border border-indigo-100 dark:border-indigo-800">
                        {res.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                          {res.patient}
                        </p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                          {res.uid}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest">
                      {res.test}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                      {res.date}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                      {res.time}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        res.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="flex items-center gap-2 ml-auto px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 dark:border-indigo-800 transition-all hover:bg-indigo-600 hover:text-white">
                      <Eye size={14} /><Link to={`/laboratory/enter-results/1`} >Edit View Details</Link>
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

export default LabResultsHistory;
