import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  FileText,
  DollarSign,
  Layers,
  ArrowDownCircle,
  Beaker,
  Tag,
  PlusCircle,
  CheckCircle,
  X,
  AlertCircle,
  Loader2,
  ArrowLeft
} from "lucide-react";

const CreateDrug = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    minStock: "",
    unit: "",
    description: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStatus({ type: "success", message: "Medication successfully added to inventory!" });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- STICKY HEADER --- */}
     <header className="flex-shrink-0 z-30  border-b border-x-0 rounded-none border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
              <div className="px-6 py-4 md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 mb-4">
            <Home size={12} className="text-zinc-400" />
            <ChevronRight size={12} className="text-zinc-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Manage Drugs</span>
            <ChevronRight size={12} className="text-zinc-300" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Create New</span>
          </nav>
              <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
                Register New Drug
              </h1>
              <p className="text-sm text-zinc-500 mt-1 font-medium">
                Define the medication parameters, pricing, and safety stock levels.
              </p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Inventory
            </button>
          </div>
        </div>
      </header>

      {/* --- FORM AREA --- */}
      <div className=" mx-auto w-full px-8 pb-20 m-4">
        
        {/* Status Alerts */}
        {status && (
          <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 ${
            status.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
            : 'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
            </div>
            <button onClick={() => setStatus(null)}><X size={18} /></button>
          </div>
        )}

        <div className="card-base shadow-2xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
              
              {/* Drug Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Drug Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Amoxicillin"
                    className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Unit Price (Purchase) <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-xs">FCFA</div>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full h-12 pl-16 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Initial Stock <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="number" 
                    required
                    placeholder="Quantity"
                    className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Min Stock Level */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Safety Threshold <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <ArrowDownCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-rose-500 transition-colors" size={18} />
                  <input 
                    type="number" 
                    required
                    placeholder="Alert level"
                    className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-rose-500/30 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Dosage Unit */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Dosage Unit <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <Beaker className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Tablets, ml, mg"
                    className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Description (Full Width) */}
              <div className="space-y-2 md:col-span-2 mt-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Additional Notes <span className="text-zinc-300 font-bold ml-1">(Optional)</span>
                </label>
                <div className="relative group">
                  <Tag className="absolute left-4 top-4 text-zinc-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea 
                    rows="4"
                    placeholder="Medication uses, contraindications, and storage instructions..."
                    className="w-full pl-12 pr-4 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end items-center gap-6">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">Fields marked with <span className="text-rose-500">*</span> are mandatory</span>
               
               <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-3 px-10 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-zinc-500/20 active:scale-95 transition-all disabled:opacity-50"
               >
                 {loading ? (
                   <Loader2 size={16} className="animate-spin" />
                 ) : (
                   <PlusCircle size={16} strokeWidth={3} />
                 )}
                 {loading ? "Registering..." : "Create Drug Definition"}
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDrug;