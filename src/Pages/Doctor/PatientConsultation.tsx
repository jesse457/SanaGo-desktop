import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  User,
  TriangleAlert,
  BadgeCheck,
  Trash2,
  X,
  CloudUpload,
  File as FileIcon,
  Loader2,
  Save,
  WifiOff,
  Globe,
  Pill,
  FlaskConical,
  Home,
  ChevronRight,
  Plus,
  Paperclip,
  Menu,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { toast } from "sonner";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import Dropdown from "../../components/Dropdown";

// --- Interfaces ---
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  patient_uid: string;
  age: number;
  gender: string;
  allergies?: string;
}

interface PrescriptionItem {
  medication_id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface LabItem {
  lab_test_definition_id: number;
  test_name: string;
  urgency: "normal" | "urgent" | "critical";
  reason: string;
  lab_tech_id?: number | string;
}

interface Medication {
  id: number;
  name: string;
  stock_quantity: number;
}

interface LabDefinition {
  id: number;
  test_name: string;
  test_code: string;
}

interface LabTech {
  id: number;
  name: string;
}

interface ConsultationContext {
  draft?: {
    id: number;
    complaint?: string;
    diagnosis_text?: string;
    general_notes?: string;
  };
  prescription_items?: PrescriptionItem[];
  lab_items?: LabItem[];
}

const PatientConsultation: React.FC = () => {
  const [activeTab, setActiveTab] = useState("clinical");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- Search & Selection ---
  const [patientQuery, setPatientQuery] = useState("");
  const [remoteResults, setRemoteResults] = useState<Patient[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // --- Form State ---
  const [recordId, setRecordId] = useState<number | null>(null);
  const [complaint, setComplaint] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState(""); 
  const [diagnosisText, setDiagnosisText] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [labItems, setLabItems] = useState<LabItem[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // --- Selection State ---
  const [tempMedId, setTempMedId] = useState("");
  const [tempLabId, setTempLabId] = useState("");

  // =========================================================
  // DATA FETCHING (Offline Enabled)
  // =========================================================

  const { data: cachedPatients } = useOfflineSync<Patient[]>({
    key: "consultation_master_list",
    fetchFn: async () => (await apiClient.get("/doctor/patients")).data.data,
    autoRefresh: true,
  });

  const { data: medicationList } = useOfflineSync<Medication[]>({
    key: "static_meds",
    fetchFn: async () => (await apiClient.get("/doctor/medical-records/medications")).data.data,
    autoRefresh: true,
  });

  const { data: labList } = useOfflineSync<LabDefinition[]>({
    key: "static_labs",
    fetchFn: async () => (await apiClient.get("/doctor/medical-records/lab-definitions")).data.data,
    autoRefresh: true,
  });

  const { data: techList } = useOfflineSync<LabTech[]>({
    key: "lab_technicians",
    fetchFn: async () => (await apiClient.get("/doctor/lab-technicians")).data.data,
    autoRefresh: true,
  });

  const { data: contextData, refetch: refreshContext } = useOfflineSync<ConsultationContext>({
    key: selectedPatient ? `consultation_context_${selectedPatient.id}` : "temp",
    fetchFn: async () => (await apiClient.get(`/doctor/medical-records/context/${selectedPatient?.id}`)).data,
    autoRefresh: !!selectedPatient,
  });

  // =========================================================
  // LOGIC
  // =========================================================

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleStatus);
    window.addEventListener("offline", handleStatus);
    return () => {
      window.removeEventListener("online", handleStatus);
      window.removeEventListener("offline", handleStatus);
    };
  }, []);

  useEffect(() => {
    if (patientQuery.length < 2) { setRemoteResults([]); return; }
    const timer = setTimeout(async () => {
      if (isOnline) {
        setIsSearchingRemote(true);
        try {
          const res = await apiClient.get("/doctor/patients", { params: { search: patientQuery } });
          setRemoteResults(res.data.data);
        } finally { setIsSearchingRemote(false); }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [patientQuery, isOnline]);

  const searchResults = useMemo(() => {
    const base = cachedPatients || [];
    if (!patientQuery) return [];
    const lower = patientQuery.toLowerCase();
    const local = base.filter(p => 
      p.first_name.toLowerCase().includes(lower) || 
      p.last_name.toLowerCase().includes(lower) || 
      p.patient_uid.toLowerCase().includes(lower)
    );
    const combined = [...local];
    remoteResults.forEach(r => { if (!combined.find(l => l.id === r.id)) combined.push(r); });
    return combined;
  }, [cachedPatients, patientQuery, remoteResults]);

  useEffect(() => {
    if (contextData?.draft) {
      setRecordId(contextData.draft.id);
      setComplaint(contextData.draft.complaint || "");
      setDiagnosisText(contextData.draft.diagnosis_text || "");
      setClinicalNotes(contextData.draft.general_notes || "");
      setPrescriptionItems(contextData.prescription_items || []);
      setLabItems(contextData.lab_items || []);
    }
  }, [contextData]);

  const resetForm = () => {
    setRecordId(null); setComplaint(""); setDiagnosisText(""); setClinicalNotes("");
    setPrescriptionItems([]); setLabItems([]); setAttachments([]);
  };

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setPatientQuery("");
    resetForm();
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const addMedication = () => {
    const med = medicationList?.find(m => m.id === parseInt(tempMedId));
    if (med && !prescriptionItems.find(i => i.medication_id === med.id)) {
      setPrescriptionItems([...prescriptionItems, { medication_id: med.id, name: med.name, dosage: "", frequency: "", duration: "" }]);
      setTempMedId("");
    }
  };

  const addLab = () => {
    const lab = labList?.find(l => l.id === parseInt(tempLabId));
    if (lab && !labItems.find(i => i.lab_test_definition_id === lab.id)) {
      setLabItems([...labItems, { lab_test_definition_id: lab.id, test_name: lab.test_name, urgency: "normal", reason: "", lab_tech_id: "" }]);
      setTempLabId("");
    }
  };

  const handleSave = async (finalize: boolean) => {
    if (!selectedPatient) return;
    if (finalize && !complaint) return toast.error("Chief complaint is required to sign.");
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append("patient_id", selectedPatient.id.toString());
      fd.append("complaint", complaint);
      fd.append("diagnosis_text", diagnosisText);
      fd.append("general_notes", clinicalNotes);
      fd.append("finalize", finalize ? "1" : "0");
      if (recordId) fd.append("id", recordId.toString());
      fd.append("prescription_items", JSON.stringify(prescriptionItems));
      fd.append("lab_items", JSON.stringify(labItems));
      attachments.forEach(f => fd.append("attachments[]", f));

      const res = await apiClient.post("/doctor/medical-records", fd);
      toast.success(finalize ? "Consultation Finalized & Signed" : "Draft Saved Successfully");
      
      if (finalize) { setSelectedPatient(null); resetForm(); }
      else { setRecordId(res.data.data.id); refreshContext(); }
    } catch (e) { toast.error("Error communicating with server"); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 h-screen flex flex-col overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors">
      
      {/* HEADER */}
      <header className="flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-30">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
              <Menu size={20} />
            </button>
            <div>
              <nav className="hidden sm:block">
                <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  <li className="flex items-center gap-1"><Home size={12}/> Home</li>
                  <ChevronRight size={10} />
                  <li className="text-indigo-600">Consultation</li>
                </ol>
              </nav>
              <h1 className="text-lg lg:text-xl font-black tracking-tight">Clinical Assessment</h1>
              <p className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                Manage diagnosis, prescriptions, and diagnostic orders
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase animate-pulse">
                <WifiOff size={12} /> Offline
              </div>
            )}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
               <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest">{isOnline ? 'Cloud Sync Active' : 'Local Storage'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} absolute lg:relative lg:w-96 w-full h-full flex-shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-40 transition-transform duration-300 ease-in-out`}>
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="relative group">
              <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                placeholder="Search patient name or ID..."
              />
              {isSearchingRemote && <Loader2 className="absolute right-3 top-3 w-5 h-5 animate-spin text-indigo-600" />}
              
              {patientQuery.length >= 2 && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => selectPatient(p)} className="w-full text-left px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex items-center gap-4 group transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-black text-xs uppercase group-hover:scale-110 transition-transform">{p.first_name[0]}{p.last_name[0]}</div>
                      <div>
                        <div className="font-black text-zinc-900 dark:text-white text-sm">{p.first_name} {p.last_name}</div>
                        <div className="text-[10px] font-bold text-zinc-400 tracking-widest">{p.patient_uid}</div>
                      </div>
                      <Globe size={14} className={`ml-auto ${cachedPatients?.find(c => c.id === p.id) ? 'text-zinc-200' : 'text-indigo-400'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
            {selectedPatient ? (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-500/20 mb-5">
                    {selectedPatient.first_name[0]}
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 uppercase border border-indigo-100 dark:border-indigo-800">
                      {selectedPatient.age} Yrs
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 uppercase">
                      {selectedPatient.gender}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Medical ID</span>
                    <p className="text-sm font-black text-zinc-700 dark:text-zinc-300 mt-1">{selectedPatient.patient_uid}</p>
                  </div>
                  <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                    <span className="text-[9px] font-black text-rose-500 uppercase flex items-center gap-2">
                      <TriangleAlert size={14}/> Critical Allergies
                    </span>
                    <p className="text-sm font-black text-rose-800 dark:text-rose-300 mt-1.5 leading-tight">
                      {selectedPatient.allergies || "No documented drug or food allergies"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-300 dark:text-zinc-800 opacity-60">
                <User size={64} strokeWidth={3} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Select a patient record</p>
              </div>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-950 min-w-0 transition-all">
          {selectedPatient ? (
            <>
              {/* TABS & ACTIONS */}
              <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 lg:px-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0 z-10">
                <div className="flex gap-6 lg:gap-8 overflow-x-auto no-scrollbar">
                  {['clinical', 'rx', 'labs', 'files'].map(key => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`pb-4 px-1 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
                    >
                      {key === 'rx' ? 'Prescriptions' : key === 'labs' ? 'Lab Orders' : key === 'files' ? 'Attachments' : 'Clinical Notes'}
                      {key === 'files' && attachments.length > 0 && (
                        <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded-md">{attachments.length}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pb-4">
                  <button onClick={() => handleSave(false)} disabled={isSaving} className="flex-1 sm:flex-none px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save size={14}/> Draft
                  </button>
                  <button onClick={() => handleSave(true)} disabled={isSaving} className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <BadgeCheck size={14}/>} Sign Record
                  </button>
                </div>
              </div>

              {/* SCROLLABLE FORM */}
              <div className="flex-1 overflow-y-auto p-4 lg:p-8 app-scrollbar">
                <div className="max-w-5xl mx-auto">
                  
                  {/* TAB: CLINICAL */}
                  {activeTab === 'clinical' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                           <TriangleAlert size={14}/> Chief Complaint <span className="text-rose-500">*</span>
                        </label>
                        <textarea 
                          value={complaint} 
                          onChange={e => setComplaint(e.target.value)} 
                          rows={3} 
                          className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                          placeholder="Describe the primary reason for this visit..."
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Initial Diagnosis</label>
                          <textarea value={diagnosisText} onChange={e => setDiagnosisText(e.target.value)} rows={3} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 text-sm font-bold outline-none" placeholder="ICD-10 or clinical assessment..."/>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Physical Examination</label>
                          <textarea value={clinicalNotes} onChange={e => setClinicalNotes(e.target.value)} rows={8} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] p-5 text-sm font-bold outline-none" placeholder="Notes on Vitals, Systemic exam, etc..."/>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: PRESCRIPTIONS */}
                  {activeTab === 'rx' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Dropdown
                            label={tempMedId ? medicationList?.find(m => m.id === parseInt(tempMedId))?.name + " (In Stock: " + medicationList?.find(m => m.id === parseInt(tempMedId))?.stock_quantity + ")" : "Select Medication from Pharmacy..."}
                            items={[
                              { label: "Select Medication from Pharmacy...", onClick: () => setTempMedId("") },
                              ...(medicationList?.map(m => ({
                                label: `${m.name} (In Stock: ${m.stock_quantity})`,
                                onClick: () => setTempMedId(m.id.toString())
                              })) || [])
                            ]}
                            className="flex-1"
                            buttonClassName="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                          />
                          <button onClick={addMedication} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                            <Plus size={16}/> Add Medication
                          </button>
                        </div>
                      </div>
                      
                      {prescriptionItems.length > 0 ? (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                                <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                                  <th className="px-6 py-4">Medication Name</th>
                                  <th className="px-6 py-4">Dosage</th>
                                  <th className="px-6 py-4">Frequency</th>
                                  <th className="px-6 py-4">Duration</th>
                                  <th className="px-6 py-4"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {prescriptionItems.map((item, idx) => (
                                  <tr key={idx} className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-black text-zinc-900 dark:text-white">{item.name}</td>
                                    <td className="px-6 py-4"><input className="w-28 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold" value={item.dosage} onChange={e => { const n = [...prescriptionItems]; n[idx].dosage = e.target.value; setPrescriptionItems(n); }} placeholder="e.g. 500mg"/></td>
                                    <td className="px-6 py-4"><input className="w-28 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold" value={item.frequency} onChange={e => { const n = [...prescriptionItems]; n[idx].frequency = e.target.value; setPrescriptionItems(n); }} placeholder="e.g. 1-0-1"/></td>
                                    <td className="px-6 py-4"><input className="w-28 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold" value={item.duration} onChange={e => { const n = [...prescriptionItems]; n[idx].duration = e.target.value; setPrescriptionItems(n); }} placeholder="e.g. 7 Days"/></td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setPrescriptionItems(prescriptionItems.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 size={16}/></button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                          <Pill size={40} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
                          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No medications prescribed yet</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: LAB ORDERS */}
                  {activeTab === 'labs' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
                       <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3">
                          <Dropdown
                            label={tempLabId ? labList?.find(l => l.id === parseInt(tempLabId))?.test_name || "Select Laboratory Test..." : "Select Laboratory Test..."}
                            items={[
                              { label: "Select Laboratory Test...", onClick: () => setTempLabId("") },
                              ...(labList?.map(l => ({
                                label: l.test_name,
                                onClick: () => setTempLabId(l.id.toString())
                              })) || [])
                            ]}
                            className="flex-1"
                            buttonClassName="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold"
                          />
                          <button onClick={addLab} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors">
                            <Plus size={16}/> Request Test
                          </button>
                       </div>
                       <div className="grid gap-4">
                          {labItems.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col lg:flex-row gap-6 items-center hover:shadow-md transition-shadow">
                               <div className="w-full lg:w-56">
                                  <p className="text-xs font-black uppercase text-zinc-900 dark:text-white">{item.test_name}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] font-black text-zinc-400 uppercase">Urgency:</span>
                                    <Dropdown
                                      label={item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)}
                                      items={[
                                        { label: "Normal", onClick: () => { const n = [...labItems]; n[idx].urgency = "normal"; setLabItems(n); } },
                                        { label: "Urgent", onClick: () => { const n = [...labItems]; n[idx].urgency = "urgent"; setLabItems(n); } },
                                        { label: "Critical", onClick: () => { const n = [...labItems]; n[idx].urgency = "critical"; setLabItems(n); } }
                                      ]}
                                      className="w-full"
                                      buttonClassName="text-[10px] font-black uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg py-1 px-2"
                                    />
                                  </div>
                               </div>
                               <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                                  <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase text-zinc-400">Assigned Technician</label>
                                     <Dropdown
                                        label={item.lab_tech_id && item.lab_tech_id !== "" ? techList?.find(t => t.id === parseInt(String(item.lab_tech_id)))?.name || "Any Available Tech" : "Any Available Tech"}
                                        items={[
                                          { label: "Any Available Tech", onClick: () => { const n = [...labItems]; n[idx].lab_tech_id = ""; setLabItems(n); } },
                                          ...(techList?.map(t => ({
                                            label: t.name,
                                            onClick: () => { const n = [...labItems]; n[idx].lab_tech_id = t.id.toString(); setLabItems(n); }
                                          })) || [])
                                        ]}
                                        className="w-full"
                                        buttonClassName="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none"
                                      />
                                  </div>
                                  <div className="space-y-1">
                                     <label className="text-[9px] font-black uppercase text-zinc-400">Clinical Indication</label>
                                     <input className="w-full text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none" value={item.reason} onChange={e => { const n = [...labItems]; n[idx].reason = e.target.value; setLabItems(n); }} placeholder="Brief clinical reason..."/>
                                  </div>
                               </div>
                               <button onClick={() => setLabItems(labItems.filter((_, i) => i !== idx))} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-colors"><X size={20}/></button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {/* TAB: ATTACHMENTS */}
                  {activeTab === 'files' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-8">
                       <div className="group border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem] p-16 text-center relative hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-all">
                          <input 
                            type="file" 
                            multiple 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            onChange={e => e.target.files && setAttachments([...attachments, ...Array.from(e.target.files)])} 
                          />
                          <CloudUpload size={56} className="mx-auto text-indigo-600 mb-5 group-hover:-translate-y-1 transition-transform" />
                          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Upload Patient Records</h3>
                          <p className="text-xs text-zinc-400 mt-2 font-bold uppercase">Drag & Drop PDF, PNG, or JPG (Max 10MB per file)</p>
                       </div>
                       
                       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                          {attachments.map((f, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between shadow-sm group">
                               <div className="flex items-center gap-4 truncate">
                                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                    <Paperclip size={18} />
                                  </div>
                                  <div className="truncate">
                                    <p className="text-[10px] font-black uppercase truncate text-zinc-900 dark:text-white tracking-tight">{f.name}</p>
                                    <p className="text-[9px] font-bold text-zinc-400 uppercase">{(f.size / 1024).toFixed(1)} KB</p>
                                  </div>
                               </div>
                               <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-opacity">
                                  <X size={16}/>
                               </button>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center transition-all">
              <div className="w-40 h-40 rounded-[4rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/5">
                <FileIcon size={80} className="text-zinc-100 dark:text-zinc-800" strokeWidth={1} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-zinc-300 dark:text-zinc-800">Clinic Portal</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">Select a patient from the sidebar to begin consultation</p>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
};

export default PatientConsultation;