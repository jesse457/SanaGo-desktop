import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  X,
  Check,
  User,
  ChevronRight,
  ChevronLeft,
  UserCircle,
  Info,
  Loader2,
  FileText,
  FlaskConical,
} from "lucide-react";
import { useOfflineSync } from "../../hooks/useOfflineSync"; 
import { apiClient } from "../../services/authService"; 
import Breadcrumbs from "../../components/Breadcrumbs";
import { cn } from "../../utils/cn";

// --- Interfaces ---
interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  patient_uid: string;
}

interface PaginatorResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

interface Medication {
  id: number;
  name: string;
  stock_quantity: number;
}

interface PrescriptionItem {
  id: number;
  medication: Medication;
  dosage: string;
  frequency: string;
  duration: string;
  quantity_prescribed: number;
  dispensed_quantity: number;
  notes: string | null;
}

interface Prescription {
  id: number;
  created_at: string;
  status: 'prescribed' | 'dispensed' | 'partial';
  doctor?: { name: string };
  items?: PrescriptionItem[];
}

interface DispenseInput {
  quantity: number;
  notes: string;
}

const DispenseMedications: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [dispenseData, setDispenseData] = useState<Record<number, DispenseInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPatientPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: patientPaginator, isLoading: patientsLoading } = useOfflineSync<PaginatorResponse<Patient>>({
    key: `pharmacist-patients-q${debouncedSearch}-p${patientPage}`,
    fetchFn: async () => {
      const res = await apiClient.get("/pharmacist/patients", {
        params: { search: debouncedSearch, page: patientPage }
      });
      return res.data.data;
    }
  });

  const { data: prescriptions, isLoading: loadingPrescriptions, refetch: refreshPrescriptions } = useOfflineSync<Prescription[]>({
    key: `patient-prescriptions-${selectedPatient?.id}`,
    fetchFn: async () => {
      if (!selectedPatient) return [];
      const res = await apiClient.get(`/pharmacist/patients/${selectedPatient.id}/prescriptions`);
      return res.data.data;
    },
    autoRefresh: !!selectedPatient
  });

  const handleViewItems = async (prescriptionId: number) => {
    setLoadingDetail(true);
    setShowModal(true);
    try {
      const res = await apiClient.get(`/pharmacist/prescriptions/${prescriptionId}`);
      setActivePrescription(res.data.data);
      const initialData: Record<number, DispenseInput> = {};
      res.data.data.items?.forEach((item: PrescriptionItem) => {
        initialData[item.id] = { quantity: 0, notes: "" };
      });
      setDispenseData(initialData);
    } catch (err) {
      setShowModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };
const handleInputChange = (itemId: number, field: keyof DispenseInput, value: string | number) => {
  setDispenseData((prev) => ({
    ...prev,
    [itemId]: {
      ...prev[itemId],
      [field]: value,
    },
  }));
};
  const handleDispenseSubmit = async () => {
    if (!activePrescription) return;
    setIsSubmitting(true);
    try {
      const itemsPayload = Object.entries(dispenseData)
        .map(([itemId, data]) => ({ id: parseInt(itemId), quantity: data.quantity, notes: data.notes }))
        .filter(item => item.quantity > 0);

      if (itemsPayload.length === 0) return alert("Enter at least one quantity.");

      await apiClient.post(`/pharmacist/prescriptions/${activePrescription.id}/dispense`, { items: itemsPayload });
      setShowModal(false);
      refreshPrescriptions();
    } catch (err: any) {
      alert(err.response?.data?.message || "Dispensing failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-colors">
      
      {/* --- HEADER --- */}
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumbs items={[{ label: "Pharmacy", path: "/pharmacist" }, { label: "Dispensing" }]} />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
              Dispensing Point
            </h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">
              Validate and process patient medication prescriptions
            </p>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search Patient UID / Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-zinc-100 dark:bg-zinc-800 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl text-xs font-bold outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">
        
        {/* SIDEBAR: PATIENT SELECTOR */}
        <aside className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <User size={14} /> Active Queue
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 app-scrollbar">
              {patientsLoading ? (
                <div className="flex justify-center p-10"><Loader2 className="animate-spin text-zinc-300" /></div>
              ) : (
                patientPaginator?.data.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className={cn(
                      "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                      selectedPatient?.id === p.id
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-white dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] border",
                        selectedPatient?.id === p.id ? "bg-white/20 border-white/20 text-white" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                      )}>
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div className="text-left">
                        <p className={cn("text-xs font-black uppercase tracking-tight", selectedPatient?.id === p.id ? "text-white" : "text-zinc-900 dark:text-zinc-100")}>
                          {p.first_name} {p.last_name}
                        </p>
                        <p className={cn("text-[9px] font-bold uppercase tracking-widest", selectedPatient?.id === p.id ? "text-blue-100" : "text-zinc-400")}>
                          {p.patient_uid}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={selectedPatient?.id === p.id ? "text-white" : "text-zinc-300"} />
                  </button>
                ))
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
                <button onClick={() => setPatientPage(p => Math.max(1, p - 1))} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"><ChevronLeft size={16}/></button>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Page {patientPaginator?.current_page}</span>
                <button onClick={() => setPatientPage(p => p + 1)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"><ChevronRight size={16}/></button>
            </div>
          </div>
        </aside>

        {/* MAIN: PRESCRIPTION LIST */}
        <main className="lg:col-span-8 overflow-hidden">
          {selectedPatient ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none flex flex-col h-full overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                    Prescriptions for <span className="text-blue-600">{selectedPatient.first_name} {selectedPatient.last_name}</span>
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">Found {prescriptions?.length || 0} active records</p>
                </div>
                <FlaskConical className="text-blue-500/20" size={32} />
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingPrescriptions ? (
                   <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-500" /></div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-50 dark:bg-zinc-950/50 backdrop-blur-md z-10">
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date Issued</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Attending Doctor</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                        <th className="px-8 py-4 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                      {prescriptions?.map((pres) => (
                        <tr key={pres.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-2 text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">
                               <Calendar size={14} className="text-blue-500" />
                               {new Date(pres.created_at).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="px-8 py-5 text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">
                            {pres.doctor?.name || "N/A"}
                          </td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border",
                              pres.status === 'dispensed' ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400"
                            )}>
                              {pres.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleViewItems(pres.id)}
                              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase rounded-xl hover:opacity-80 transition-all"
                            >
                              Open Prescription
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900/30 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <UserCircle size={32} className="text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase">Awaiting Selection</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">Select a patient from the queue to view their medical prescriptions</p>
            </div>
          )}
        </main>
      </div>

      {/* --- DISPENSE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => !loadingDetail && setShowModal(false)} />
          <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800">
            
            {loadingDetail ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Accessing Medical Records...</p>
                </div>
            ) : (
                <>
                <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div>
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">Dispensing Order</h2>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase mt-1 tracking-widest">Invoice Ref: #{activePrescription?.id}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto app-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 z-10">
                    <tr className="bg-zinc-50/50 dark:bg-zinc-900">
                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Item Detail</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Progress</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest w-32">Qty to Release</th>
                        <th className="px-6 py-4 text-[9px] font-black uppercase text-zinc-400 tracking-widest">Internal Notes</th>
                        <th className="px-6 py-4 text-right text-[9px] font-black uppercase text-zinc-400 tracking-widest">Vault Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {activePrescription?.items?.map((item) => {
                        const stock = item.medication.stock_quantity;
                        const remaining = item.quantity_prescribed - item.dispensed_quantity;
                        const currentInput = dispenseData[item.id] || { quantity: 0, notes: "" };

                        return (
                        <tr key={item.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/20">
                            <td className="px-6 py-5">
                                <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{item.medication.name}</p>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mt-1">{item.dosage} | {item.frequency}</p>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex flex-col">
                                  <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">{item.dispensed_quantity} / {item.quantity_prescribed}</span>
                                  <div className="w-20 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${(item.dispensed_quantity / item.quantity_prescribed) * 100}%` }}></div>
                                  </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <input
                                    type="number"
                                    min={0}
                                    max={Math.min(remaining, stock)}
                                    value={currentInput.quantity || ""}
                                    onChange={(e) => handleInputChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-full h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-black outline-none focus:border-blue-500 transition-colors"
                                />
                            </td>
                            <td className="px-6 py-5">
                                <div className="relative">
                                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="text"
                                        value={currentInput.notes}
                                        onChange={(e) => handleInputChange(item.id, 'notes', e.target.value)}
                                        placeholder="Add comment..."
                                        className="w-full h-10 pl-9 pr-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-bold outline-none"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                <span className={cn(
                                  "px-2 py-1 rounded-lg text-[9px] font-black border tracking-widest uppercase",
                                  stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400'
                                )}>
                                    {stock} UNITS
                                </span>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>

                <div className="px-8 py-6 bg-zinc-50/50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Info size={16} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Verify stock availability before signature.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => setShowModal(false)} className="flex-1 sm:flex-none px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
                        <button 
                            onClick={handleDispenseSubmit}
                            disabled={isSubmitting}
                            className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            Finalize Release
                        </button>
                    </div>
                </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DispenseMedications;