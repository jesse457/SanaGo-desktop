import React, { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Beaker,
  ChevronRight,
  Home,
  DollarSign,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";

const ManageLabTests = () => {
  const [search, setSearch] = useState("");

  const tests = [
    {
      id: 1,
      name: "Complete Blood Count",
      code: "CBC-01",
      price: "25.00",
      units: "cells/mcL",
    },
    {
      id: 2,
      name: "Lipid Profile",
      code: "LIP-09",
      price: "45.00",
      units: "mg/dL",
    },
    {
      id: 3,
      name: "Urinalysis",
      code: "URN-12",
      price: "15.00",
      units: "pH/Specific Gravity",
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
              Test Definitions
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Manage diagnostic test parameters, pricing, and units.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
            <Plus size={16} strokeWidth={3} />{" "}
            <Link to={`/laboratory/create-test`}>Add New Test</Link>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by test name or laboratory code..."
              className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* TABLE */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Test Identity
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">
                Unit Price
              </th>
              <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Measurement Units
              </th>
              <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {tests.map((test) => (
              <tr
                key={test.id}
                className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
              >
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                    {test.name}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase font-mono tracking-tighter">
                    Code: {test.code}
                  </p>
                </td>
                <td className="px-8 py-5 text-center">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    ${test.price}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-tighter">
                    {test.units}
                  </p>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all">
                      <Pencil size={16} strokeWidth={2.5} />
                    </button>
                    <button className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all">
                      <Trash2 size={16} strokeWidth={2.5} />
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

export default ManageLabTests;
