import React, { useState, useRef, ChangeEvent, FormEvent, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { User, Beaker, Stethoscope, MessageCircle, Pencil, CloudUpload, FileText, CheckCircle2, Info, X, Loader2, AlertCircle } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";

const EnterLabResults: React.FC = () => {
  const { id: requestId } = useParams<{ id: string }>(); 
  const navigate = useNavigate();
  const location = useLocation(); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resultsText, setResultsText] = useState("");
  const [analysisComments, setAnalysisComments] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const attachmentError = useMemo(() => {
    const key = Object.keys(validationErrors).find(k => k.startsWith('attachments'));
    return key ? validationErrors[key][0] : null;
  }, [validationErrors]);

  const { data: request, isLoading } = useOfflineSync<any>({
    key: `lab-request-${requestId}`,
    fetchFn: async () => {
      const response = await apiClient.get(`/lab-technician/lab-requests/${requestId}`);
      return response.data?.data || response.data;
    },
  });

  const activeData = request || location.state?.request;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      const newFiles = Array.from(e.target.files).filter(file => 
        file.size <= 10 * 1024 * 1024 && allowed.includes(file.type)
      );
      if (newFiles.length < e.target.files.length) {
        setSubmitError("Some files were rejected. Ensure they are PDF/JPG/PNG and under 10MB.");
      }
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setValidationErrors({});

    const formData = new FormData();
    formData.append("results_text", resultsText.trim());
    formData.append("analysis_comments", analysisComments.trim());
    
    // IMPORTANT: Append as 'attachments[]' so Laravel sees it as an array
    attachments.forEach((file) => {
      formData.append("attachments[]", file);
    });

    try {
      await apiClient.post(`/lab-technician/lab-requests/${requestId}/results`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Explicitly set for file uploads
        },
      });
      navigate("/laboratory/requests");
    } catch (err: any) {
      if (err.response?.status === 422) {
        setValidationErrors(err.response.data.errors || {});
        setSubmitError("Validation failed. Please check your data and files.");
      } else {
        setSubmitError(err.response?.data?.message || "Failed to submit. Check server connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !activeData) return <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="flex flex-col h-full bg-zinc-50/50 dark:bg-zinc-950 animate-in fade-in duration-500">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6">
        <div className="max-w-6xl mx-auto w-full">
          <Breadcrumbs items={[{ label: "Workflow Queue", path: "/laboratory/requests" }, { label: "Results Entry" }]} />
          <div className="flex items-end justify-between mt-2">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Laboratory Entry</h1>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                Request <span className="text-zinc-900 dark:text-zinc-300">#{requestId}</span> — Priority: 
                <span className={activeData?.priority === 'high' ? 'text-rose-500 ml-1' : 'text-emerald-500 ml-1'}>
                  {activeData?.priority?.toUpperCase() || 'NORMAL'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryItem icon={<User size={16} />} label="Patient" value={activeData?.patient ? `${activeData.patient.first_name} ${activeData.patient.last_name}` : "---"} sub={`UID: ${activeData?.patient?.patient_uid || '---'}`} color="text-blue-500" />
          <SummaryItem icon={<Beaker size={16} />} label="Investigation" value={activeData?.test_definition?.test_name || "---"} sub={`Units: ${activeData?.test_definition?.units || 'N/A'}`} color="text-indigo-500" />
          <SummaryItem icon={<Stethoscope size={16} />} label="Requested By" value={activeData?.doctor?.last_name ? `Dr. ${activeData.doctor.last_name}` : "Physician"} sub={activeData?.doctor?.specialization || "Clinical Physician"} color="text-emerald-500" />
          <SummaryItem icon={<MessageCircle size={16} />} label="Clinical Indication" value={activeData?.clinical_notes || "No notes"} sub="Reason for Test" color="text-amber-500" />
        </div>

        {submitError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 animate-in shake">
            <AlertCircle size={18} />
            <p className="text-[10px] font-black uppercase tracking-widest">{submitError}</p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Diagnostic Findings <span className="text-rose-500">*</span>
                  </label>
                  {validationErrors.results_text && <span className="text-[9px] font-bold text-rose-500 uppercase">{validationErrors.results_text[0]}</span>}
                </div>
                <div className="relative">
                  <textarea rows={12} value={resultsText} onChange={(e) => setResultsText(e.target.value)} placeholder="Enter the clinical analysis results..." className={`w-full p-6 bg-zinc-50 dark:bg-zinc-950 border rounded-3xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none ${validationErrors.results_text ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800'}`} />
                  <Pencil className="absolute bottom-6 right-6 text-zinc-300" size={18} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" /> Specimen Observations
                </label>
                <textarea rows={12} value={analysisComments} onChange={(e) => setAnalysisComments(e.target.value)} placeholder="Optional technical notes..." className="w-full p-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-medium text-zinc-500 focus:border-zinc-400 transition-all outline-none resize-none italic" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Documentation Attachments</h4>
                {attachmentError && <span className="text-[9px] font-bold text-rose-500 uppercase">{attachmentError}</span>}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
                <div onClick={() => fileInputRef.current?.click()} className={`group flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-[2rem] transition-all cursor-pointer ${attachmentError ? 'border-rose-500 bg-rose-50/50' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500'}`}>
                  <CloudUpload size={28} className="text-zinc-400 group-hover:text-indigo-500" />
                  <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest mt-2">Select Reports</p>
                </div>

                <div className="space-y-3">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <FileText className="text-indigo-500" size={16} />
                        <span className="text-xs font-black truncate max-w-[150px] text-zinc-800 dark:text-zinc-200">{file.name}</span>
                      </div>
                      <button type="button" onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))} className="text-zinc-400 hover:text-rose-500"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info size={14} />
                <p className="text-[9px] font-black uppercase tracking-widest">Released results are sent immediate.</p>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button type="button" onClick={() => navigate("/laboratory/requests")} className="flex-1 md:flex-none px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Discard</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {isSubmitting ? "Releasing..." : "Release Results"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SummaryItem: React.FC<any> = ({ icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-[1.5rem] flex items-center gap-4">
    <div className={`p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl ${color}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{value}</p>
      <p className="text-[10px] font-bold text-zinc-500 mt-0.5 truncate">{sub}</p>
    </div>
  </div>
);

export default EnterLabResults;