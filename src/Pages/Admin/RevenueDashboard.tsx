import React, { useState } from "react";
import {
  Banknote, TrendingUp, TrendingDown, Beaker, CalendarDays, ClipboardCheck, 
  Building2, Search, Filter, ArrowUpRight, ArrowDownRight, 
  Download, MoreHorizontal, ChevronDown, Bell
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs"; // Assuming you have this

// Helper for formatting currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US').format(amount);
};

const RevenueDashboard = () => {
  const [timePeriod, setTimePeriod] = useState("Month");

  // Enhanced metrics data
  const metrics = [
    { title: "Pharmacy & Meds", amount: 240000, trend: "12.5%", up: true, icon: Beaker, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/10" },
    { title: "Consultations", amount: 125500, trend: "3.1%", up: true, icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/10" },
    { title: "Lab Services", amount: 88000, trend: "1.4%", up: false, icon: ClipboardCheck, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/10" },
    { title: "In-Patient Care", amount: 450000, trend: "8.2%", up: true, icon: Building2, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-500/10" },
  ];

  // Enhanced Table Data
  const transactions = [
    { id: "PAT-8821", name: "Johnathan Doe", date: "Oct 24, 2023", meds: 45000, lab: 12000, total: 57000, status: "Paid" },
    { id: "PAT-8822", name: "Sarah Smith", date: "Oct 24, 2023", meds: 15000, lab: 0, total: 15000, status: "Pending" },
    { id: "PAT-8823", name: "Michael Brown", date: "Oct 23, 2023", meds: 120000, lab: 45000, total: 165000, status: "Paid" },
    { id: "PAT-8824", name: "Emily White", date: "Oct 23, 2023", meds: 5000, lab: 5000, total: 10000, status: "Failed" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-zinc-50/50 dark:bg-zinc-950/50 min-h-screen p-6 space-y-6 font-sans text-zinc-900 dark:text-zinc-100">
      
      {/* 1. HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* Reuse your Breadcrumbs component or a placeholder */}
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
            <span>Financials</span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 dark:text-zinc-100">Revenue Analytics</span>
          </div>
          
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Revenue Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20">
                Live Data
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {["Today", "Week", "Month", "Year"].map((p) => (
              <button
                key={p}
                onClick={() => setTimePeriod(p)}
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
          <button className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors">
            <Bell size={18} />
          </button>
        </div>
      </header>

      {/* 2. MAIN SUMMARY CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-end gap-8 relative z-10">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-zinc-500">Gross Collection ({timePeriod})</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-semibold text-zinc-400">FCFA</span>
                            <h2 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">903,500</h2>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold">
                            <TrendingUp size={14} /> 
                            <span>+12.5% vs last period</span>
                        </div>
                        <p className="text-xs text-zinc-400">
                           Prev: <span className="font-medium text-zinc-600 dark:text-zinc-300">782,000</span>
                        </p>
                    </div>
                </div>

                {/* Refined Bar Chart */}
                <div className="flex gap-3 h-24 items-end pb-1">
                    {[35, 55, 45, 80, 60, 95, 70].map((h, i) => (
                    <div key={i} className="group flex flex-col items-center gap-2">
                        <div 
                        style={{ height: `${h}%` }} 
                        className={`w-3 sm:w-4 rounded-full transition-all duration-500 ${
                            i === 5 
                            ? 'bg-indigo-600 dark:bg-indigo-500 shadow-lg shadow-indigo-500/20' 
                            : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900'
                        }`} 
                        />
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Quick Action / Mini Card */}
        <div className="bg-indigo-600 dark:bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between shadow-lg shadow-indigo-600/20">
            <div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <Banknote className="text-white" size={20} />
                </div>
                <h3 className="text-lg font-semibold mb-1">Pending Settlements</h3>
                <p className="text-indigo-100 text-sm mb-6">Unpaid invoices from insurance partners.</p>
                <div className="text-3xl font-bold">14</div>
                <div className="text-sm text-indigo-200">Totaling FCFA 2.4M</div>
            </div>
            <button className="w-full py-3 bg-white text-indigo-600 text-sm font-bold rounded-xl mt-4 hover:bg-indigo-50 transition-colors">
                View Details
            </button>
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
                <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(m.amount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 4. PATIENTS PAYMENT TABLE */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col flex-1">
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Recent Transactions</h3>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input 
                className="w-full sm:w-64 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 h-9 rounded-lg pl-9 pr-4 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400" 
                placeholder="Search transaction..." 
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
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Net Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {transactions.map((t, i) => (
                <tr key={i} className="group hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors text-sm">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                            {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="font-mono text-xs text-zinc-500">
                        #{t.id}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-500 text-xs">
                    {t.date}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-zinc-900 dark:text-zinc-100">
                     {formatCurrency(t.total)}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                        t.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                        t.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}>
                        {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex justify-center">
                        <button className="p-1.5 rounded-md text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
            <span>Showing 4 of 128 transactions</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800">Prev</button>
                <button className="px-3 py-1 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;