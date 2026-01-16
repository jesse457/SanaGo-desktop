import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Home,
  ChevronRight,
  User,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const ShiftsView = () => {
  const shifts = [
    {
      date: "Monday, Jan 12",
      type: "Morning",
      hours: "08:00 AM - 04:00 PM",
      staff: 5,
    },
    {
      date: "Monday, Jan 12",
      type: "Afternoon",
      hours: "04:00 PM - 12:00 AM",
      staff: 3,
    },
    {
      date: "Monday, Jan 12",
      type: "Night",
      hours: "12:00 AM - 08:00 AM",
      staff: 2,
    },
  ];

  const getTypeColor = (type) => {
    const map = {
      morning:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      afternoon:
        "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      night:
        "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    };
    return map[type.toLowerCase()] || map.morning;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[{ label: "Admin" }, { label: "Staff Duty Roster" }]}
            />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
              Duty Roster
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              See which staff are working and when their shifts end.
            </p>
          </div>
          <button className="button-primary flex items-center gap-2 py-3 px-6 shadow-xl">
            <Plus size={20} strokeWidth={3} /> Add New Shift
          </button>
        </div>
      </header>

      <div className="m-4 flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-8 py-5">Date & Day</th>
              <th className="px-8 py-5">Shift Time</th>
              <th className="px-8 py-5">Working Hours</th>
              <th className="px-8 py-5">Staff on Duty</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {shifts.map((s, i) => (
              <tr
                key={i}
                className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
              >
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-zinc-900 dark:text-white">
                    {s.date}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5 opacity-70">
                    Year 2026
                  </p>
                </td>
                <td className="px-8 py-5">
                  <span
                    className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest ${getTypeColor(
                      s.type
                    )}`}
                  >
                    {s.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3 text-xs font-black text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 w-fit">
                    <Clock
                      size={16}
                      className="text-primary-500"
                      strokeWidth={2.5}
                    />
                    {s.hours}
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-sm"
                      >
                        {n}
                      </div>
                    ))}
                    {s.staff > 3 && (
                      <div className="w-9 h-9 rounded-full bg-primary-500 text-white border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary-500/20">
                        +{s.staff - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                    <button className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-600 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      <Pencil size={18} />
                    </button>
                    <button className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shifts.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center">
            <Calendar className="w-16 h-16 text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-bold italic">
              No shifts have been planned yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftsView;
