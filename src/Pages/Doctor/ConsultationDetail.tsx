import React, { useState } from "react";
import {
  Home, ChevronRight, CalendarDays, FileText, Beaker, Paperclip,
  Loader2, Download, RefreshCcw, Stethoscope, X, Eye
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiClient } from "../../services/authService";
import { useOfflineSync } from "../../hooks/useOfflineSync"; 
import { toast } from "sonner";

// --- Types ---
interface Attachment {
  id: number;
  file_name: string;
  file_url: string;
  file_type?: string; // mime type if available
}

const ConsultationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"prescriptions" | "labResults">("prescriptions");
  
  // New State for Modal
  const [viewingFile, setViewingFile] = useState<Attachment | null>(null);

  // 1. Fetch Data
  const { 
    data: consultation, 
    isLoading, 
    isSyncing 
  } = useOfflineSync<any>({
    key: `consultation_detail_${id}`,
    fetchFn: async () => {
      const res = await apiClient.get(`/doctor/consultations/${id}`);
      return res.data.data;
    },
    autoRefresh: true, 
  });

  const prescriptions = consultation?.prescriptions || [];
  const labResults = consultation?.lab_results || [];

  const formatDate = (dateString: string, includeTime = false) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      ...(includeTime && { hour: '2-digit', minute: '2-digit' })
    });
  };

  if (isLoading && !consultation) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center space-y-4 bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Loading Record...</p>
      </div>
    );
  }

  if (!consultation) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-full">
                <FileText className="w-8 h-8 text-zinc-400" />
            </div>
            <p className="text-sm font-bold text-zinc-500">Consultation record not found</p>
            <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold text-sm hover:underline">
                Go Back
            </button>
        </div>
      );
  }

  return (
    <main className="w-full h-full bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-600 dark:text-zinc-300 overflow-y-auto app-scrollbar p-4 sm:p-6 relative">
        
        {/* --- MODAL OVERLAY --- */}
        {viewingFile && (
          <FilePreviewModal 
            file={viewingFile} 
            onClose={() => setViewingFile(null)} 
          />
        )}

        {/* --- TOP NAVIGATION --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <nav aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-2">
                    <li>
                        <Link to="/doctor/dashboard" className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-indigo-600 flex items-center">
                            <Home className="w-3 h-3 mr-1" /> Home
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3 text-zinc-300" /></li>
                    <li>
                        <Link to={`/doctor/patient/${consultation.patient?.id}`} className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-indigo-600">
                            {consultation.patient?.first_name} {consultation.patient?.last_name}
                        </Link>
                    </li>
                    <li><ChevronRight className="w-3 h-3 text-zinc-300" /></li>
                    <li><span className="text-[10px] font-black uppercase tracking-wider text-zinc-900 dark:text-white">Session #{consultation.id}</span></li>
                </ol>
            </nav>

            <div className="flex items-center gap-3">
                {isSyncing && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full animate-pulse">
                        <RefreshCcw size={12} className="animate-spin" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Syncing</span>
                    </div>
                )}
                <button 
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-black uppercase tracking-tight hover:bg-zinc-50 transition-colors shadow-sm"
                >
                    <Download size={14} /> Export PDF
                </button>
            </div>
        </div>

        {/* --- INFO CARD --- */}
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                        <CalendarDays size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                            {formatDate(consultation.created_at)}
                        </h2>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                            {new Date(consultation.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm uppercase">
                        {consultation.doctor?.name?.charAt(0) || "D"}
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tighter">Attending Physician</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-white">Dr. {consultation.doctor?.name || "Unknown"}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <Stethoscope size={16} />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Final Diagnosis</h3>
                    </div>
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30">
                        <p className="text-zinc-900 dark:text-zinc-100 text-base font-bold leading-relaxed">
                            {consultation.diagnosis_text || "No primary diagnosis recorded"}
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                        <FileText size={16} />
                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em]">Clinical Notes</h3>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {consultation.general_notes || consultation.soap_notes || "No clinical notes provided."}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto">
            <button 
                onClick={() => setActiveTab("prescriptions")}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.15em] transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "prescriptions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
            >
                <FileText size={16} /> Prescriptions ({prescriptions.length})
            </button>
            <button 
                onClick={() => setActiveTab("labResults")}
                className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.15em] transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "labResults" ? "border-emerald-600 text-emerald-600" : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
            >
                <Beaker size={16} /> Lab Results ({labResults.length})
            </button>
        </div>

        {/* --- TAB CONTENT --- */}
        <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* 1. PRESCRIPTIONS TAB */}
            {activeTab === "prescriptions" && (
                <div className="space-y-6">
                    {prescriptions.length > 0 ? (
                        prescriptions.map((prescription: any) => (
                            <div key={prescription.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                                <div className="px-8 py-5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <h3 className="font-black text-zinc-900 dark:text-white text-sm uppercase tracking-tight">Prescription #{prescription.id}</h3>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Issued {formatDate(prescription.created_at, true)}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-black text-indigo-600 uppercase">
                                        Verified
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-zinc-50/50 dark:bg-zinc-900">
                                            <tr>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Medication</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dosage</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Frequency</th>
                                                <th className="px-6 sm:px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Duration</th>
                                                <th className="px-6 sm:px-8 py-4 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                            {prescription.items?.map((item: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-6 sm:px-8 py-5 text-sm text-zinc-900 dark:text-white font-black">{item.drug_name}</td>
                                                    <td className="px-6 sm:px-8 py-5 text-sm font-bold text-zinc-500">{item.dosage}</td>
                                                    <td className="px-6 sm:px-8 py-5 text-sm font-bold text-zinc-500">{item.frequency}</td>
                                                    <td className="px-6 sm:px-8 py-5 text-sm font-bold text-zinc-500">{item.duration}</td>
                                                    <td className="px-6 sm:px-8 py-5 text-sm text-right font-black text-indigo-600">{item.quantity_prescribed}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={<FileText size={40} />} label="No prescriptions issued" />
                    )}
                </div>
            )}

            {/* 2. LAB RESULTS TAB */}
            {activeTab === "labResults" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {labResults.length > 0 ? (
                        labResults.map((result: any) => (
                            <div key={result.id} className="bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-full">
                                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                                            <Beaker size={18} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-zinc-900 dark:text-white text-xs uppercase">
                                                {result.test_name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                                                Tech: {result.technician_name}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                                        result.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                    }`}>
                                        {result.status}
                                    </span>
                                </div>

                                <div className="p-6 flex-1 flex flex-col gap-4">
                                    <div>
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Findings</h4>
                                        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-wrap leading-relaxed">
                                                {result.results_text || "Waiting for results..."}
                                            </p>
                                        </div>
                                    </div>

                                    {result.analysis_comments && (
                                        <div>
                                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Technician Comments</h4>
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                                <p className="text-xs italic text-amber-800 dark:text-amber-200">
                                                    "{result.analysis_comments}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Attachments</h4>
                                        {result.attachments?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {result.attachments.map((att: Attachment) => (
                                                    <button
                                                        key={att.id}
                                                        onClick={() => setViewingFile(att)}
                                                        className="inline-flex items-center px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                                                    >
                                                        <Paperclip className="w-3 h-3 mr-2 group-hover:text-white" />
                                                        <span className="truncate max-w-[150px]">{att.file_name}</span>
                                                        <Eye className="w-3 h-3 ml-2 opacity-50 group-hover:opacity-100" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] italic text-zinc-400">No files attached</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <EmptyState icon={<Beaker size={40} />} label="No lab results found" />
                    )}
                </div>
            )}
        </div>
    </main>
  );
};

// Reusable Empty State Component
const EmptyState = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <div className="col-span-full bg-white dark:bg-zinc-900 rounded-[2rem] p-12 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto text-zinc-200 mb-4 flex justify-center">{icon}</div>
        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">{label}</p>
    </div>
);

// --- NEW FILE PREVIEW MODAL ---
interface FileModalProps {
  file: Attachment;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FileModalProps> = ({ file, onClose }) => {
  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.file_name);
  const isPdf = /\.pdf$/i.test(file.file_name);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3 overflow-hidden">
             <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg">
                <Paperclip size={18} />
             </div>
             <h3 className="font-black text-zinc-900 dark:text-white text-sm truncate uppercase tracking-tight">
               {file.file_name}
             </h3>
          </div>
          <div className="flex items-center gap-2">
             <a 
                href={file.file_url} 
                download 
                target="_blank"
                className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                title="Download"
             >
               <Download size={20} />
             </a>
             <button 
               onClick={onClose}
               className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-zinc-100 dark:bg-black/50 overflow-hidden flex items-center justify-center relative">
           {isImage ? (
             <img 
               src={file.file_url} 
               alt={file.file_name} 
               className="max-w-full max-h-full object-contain p-4"
             />
           ) : isPdf ? (
             <iframe 
               src={file.file_url} 
               className="w-full h-full border-0"
               title="PDF Preview"
             />
           ) : (
             <div className="text-center p-8">
               <FileText size={64} className="mx-auto text-zinc-300 mb-4" />
               <p className="text-zinc-500 font-bold mb-4">Preview not available for this file type.</p>
               <a 
                 href={file.file_url} 
                 download 
                 target="_blank"
                 className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg"
               >
                 <Download size={18} /> Download File
               </a>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetail;