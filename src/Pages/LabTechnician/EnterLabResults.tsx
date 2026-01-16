import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  User,
  Beaker,
  Stethoscope,
  MessageCircle,
  Pencil,
  CloudUpload,
  FileText,
  CheckCircle2,
  Download,
  Info,
  X
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const EnterLabResults = () => {
  const [files, setFiles] = useState([
    { name: "blood_smear_v1.png", size: "2.4MB" }
  ]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6 mb-8">
        <div className="max-w-6xl mx-auto w-full">
           <Breadcrumbs
                      items={[{ label: "Lab Requests" }, { label: "Enter Results" }]}
                    />
         
          
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            Laboratory Results Entry
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-medium italic">"Analysis for Request #LAB-9921 — Standard Priority"</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-8 pb-20 space-y-8">
        
        {/* SUMMARY BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryItem icon={<User size={16} />} label="Patient" value="Alex Rivera" sub="UID: PT-8821" color="text-blue-500" />
          <SummaryItem icon={<Beaker size={16} />} label="Test Type" value="Lipid Profile" sub="Units: mg/dL" color="text-indigo-500" />
          <SummaryItem icon={<Stethoscope size={16} />} label="Requested By" value="Dr. Sarah Smith" sub="Cardiology" color="text-emerald-500" />
          <SummaryItem icon={<MessageCircle size={16} />} label="Reason" value="Routine Checkup" sub="Patient requested" color="text-amber-500" />
        </div>

        {/* DATA ENTRY CARD */}
        <div className="card-base shadow-2xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden">
          <form className="p-8 lg:p-10 space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Diagnostic Results */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Diagnostic Results
                </label>
                <div className="relative group">
                    <textarea rows="10" placeholder="Enter formal clinical findings here..." className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 transition-all outline-none resize-none leading-relaxed" />
                    <Pencil className="absolute bottom-4 right-4 text-zinc-300" size={18} />
                </div>
              </div>

              {/* Technician Comments */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Internal Technician Comments
                </label>
                <div className="relative group">
                    <textarea rows="10" placeholder="Optional notes regarding the specimen or analysis process..." className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-500 focus:bg-white dark:focus:bg-zinc-800 transition-all outline-none resize-none italic" />
                </div>
              </div>
            </div>

            {/* ATTACHMENT AREA */}
            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-6">Reports & Imaging Attachments</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Dropzone */}
                <div className="group relative flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer">
                  <CloudUpload size={48} className="text-zinc-300 group-hover:text-indigo-500 transition-colors mb-4" />
                  <p className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest">Upload Report File</p>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">PDF, JPEG, or PNG up to 10MB</p>
                </div>

                {/* File List */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Attached Files ({files.length})</p>
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-3">
                            <FileText className="text-indigo-500" size={20} />
                            <div>
                                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200">{file.name}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase">{file.size}</p>
                            </div>
                        </div>
                        <button className="p-2 text-zinc-400 hover:text-rose-500 transition-colors"><X size={16} strokeWidth={3} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-zinc-400">
                    <Info size={16} />
                    <p className="text-[10px] font-black uppercase tracking-tight">Ensure all metrics are verified before submission</p>
                </div>
                <div className="flex gap-4">
                    <button type="button" className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500">Discard</button>
                    <button type="submit" className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all">
                        <CheckCircle2 size={16} strokeWidth={3} /> Finalize Results
                    </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENT: SUMMARY ITEM --- */
const SummaryItem = ({ icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl ${color} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] leading-none mb-1.5">{label}</p>
        <p className="text-sm font-black text-zinc-900 dark:text-white tracking-tight leading-none">{value}</p>
        <p className="text-[10px] font-bold text-zinc-500 mt-1 leading-none">{sub}</p>
      </div>
    </div>
  </div>
);

export default EnterLabResults;