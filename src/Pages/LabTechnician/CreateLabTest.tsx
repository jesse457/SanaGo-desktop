import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  Beaker,
  DollarSign,
  Scale,
  PencilLine,
  Check,
  X,
  PlusCircle,
  Loader2,
  ClipboardList,
  ArrowLeft
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const CreateLabTest = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus({ type: "success", message: "Lab test definition created successfully!" });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6 mb-8">
        <div className="max-w-4xl mx-auto w-full">
           <Breadcrumbs
            items={[{ label: "Admin" }, { label: "Money Collected" }]}
          />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                New Test Definition
              </h1>
              <p className="text-sm text-zinc-500 mt-1 font-medium">
                Define parameters, pricing, and measurement units for diagnostic tests.
              </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Catalog
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-8 pb-20">
        {status && (
          <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 ${
            status.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
            : 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center gap-3">
              <Check size={20} strokeWidth={3} />
              <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
            </div>
            <button onClick={() => setStatus(null)}><X size={18} /></button>
          </div>
        )}

        <div className="card-base shadow-2xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10">
            <div className="space-y-10">
              {/* Section Header */}
              <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ClipboardList size={20} strokeWidth={2.5} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Technical Configuration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Test Name <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" required placeholder="e.g., Complete Blood Count (CBC)" className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Price (USD) <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xs">$</div>
                    <input type="number" step="0.01" required placeholder="0.00" className="w-full h-12 pl-10 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Unit of Measure <span className="text-rose-500">*</span></label>
                  <div className="relative group">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input type="text" required placeholder="e.g., mg/dL, mmol/L" className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Clinical Description</label>
                  <div className="relative group">
                    <PencilLine className="absolute left-4 top-4 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <textarea rows="4" placeholder="Briefly describe what this test analyzes..." className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none resize-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
              <button type="button" className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} strokeWidth={3} />}
                {loading ? "Registering..." : "Publish Lab Test"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLabTest;