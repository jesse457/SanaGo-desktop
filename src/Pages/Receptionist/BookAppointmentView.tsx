import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  PlusCircle,
  X,
  Check,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  Loader2,
  ClipboardCheck,
  ArrowRight,
  WifiOff
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { useOfflineSync } from "../../hooks/useOfflineSync";

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  uid?: string;
  phone?: string;
}

interface Doctor {
  id: number;
  name: string;
  department?: string;
}

const BookAppointmentView = () => {
  const navigate = useNavigate();
  
  // --- Form State ---
  const [patientSearch, setPatientSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [price, setPrice] = useState(""); // State for Price
  const [submitLoading, setSubmitLoading] = useState(false);

  // --- Hook 1: Fetch Doctors List ---
  const { 
    data: dashboardData, 
    error: doctorError 
  } = useOfflineSync<any>({
    key: "reception_dashboard_main",
    fetchFn: async () => {
      const response = await apiClient.get('/receptionist/dashboard'); 
      return response.data;
    }
  });

  const doctors: Doctor[] = dashboardData?.dropdowns?.doctors || [];
  const isOffline = !!doctorError;

  // --- Hook 2: Patient Search ---
  useEffect(() => {
    const timer = setTimeout(() => {
      if (patientSearch.trim().length >= 2 && !selectedPatient) {
        setDebouncedSearch(patientSearch);
      } else {
        setDebouncedSearch("");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [patientSearch, selectedPatient]);

  const {
    data: searchResults,
    isLoading: isSearching
  } = useOfflineSync<Patient[]>({
    key: `patient_search_${debouncedSearch}`, 
    fetchFn: async () => {
      if (!debouncedSearch) return [];
      // Calls the backend search logic (previously getAppointmentsQuery context)
      const response = await apiClient.get(`/receptionist/patients/search?query=${debouncedSearch}`);
      return response.data.data || response.data;
    },
    autoRefresh: false 
  });

  const foundPatients = searchResults || [];

  // --- Actions ---
  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
        toast.error("Cannot book appointments while offline.");
        return;
    }
    if (!selectedPatient || !selectedDoctorId || !time) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        patient_id: selectedPatient.id,
        doctor_id: selectedDoctorId,
        date: date,
        time: time,
        reason: reason,
        price: price ? parseFloat(price) : null // Logic to send price
      };

      await apiClient.post('/receptionist/appointments', payload);
      toast.success(`Success: ${selectedPatient.first_name} added to queue.`);
      navigate("/reception/appointments");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // UI Classes
  const labelClasses = "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";
  const sectionTitleClasses = "text-xs font-black text-zinc-900 dark:text-white uppercase tracking-[0.15em] flex items-center gap-3";
  const inputContainerClasses = "flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 focus-within:border-primary-500 transition-all focus-within:ring-4 focus-within:ring-primary-500/10";
  const inputBaseClasses = "w-full py-3.5 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 placeholder:font-medium disabled:opacity-50";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Appointments" }, { label: "Book Appointment" }]} />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Book Appointment {isOffline && <WifiOff className="text-rose-500 w-5 h-5 animate-pulse" />}
            </h1>
          </div>
        </div>
      </header>

      <div className="card-base shadow-xl m-5 overflow-hidden flex flex-col">
        <form onSubmit={handleBooking} className="flex flex-col h-full">
          <div className="p-8 md:p-10 space-y-12 flex-1 overflow-y-auto">
            
            {/* 1. PATIENT SELECTION */}
            <section className="space-y-6">
              <h2 className={sectionTitleClasses}>
                <span className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">1</span>
                Select Patient
              </h2>

              {!selectedPatient ? (
                <div className="relative">
                  <div className={inputContainerClasses}>
                    <Search size={18} className="text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Type patient name..."
                      className={inputBaseClasses}
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      disabled={isOffline}
                    />
                    {isSearching && <Loader2 size={18} className="animate-spin text-primary-500" />}
                  </div>

                  {/* SEARCH RESULTS DROPDOWN */}
                  {foundPatients.length > 0 && debouncedSearch && (
                    <div className="absolute z-20 mt-2 w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      {foundPatients.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSelectedPatient(p);
                            setPatientSearch("");
                            setDebouncedSearch("");
                          }}
                          className="w-full text-left px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b last:border-0 border-zinc-100 dark:border-zinc-800 group flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-white">
                              {p.full_name || `${p.first_name} ${p.last_name}`}
                            </p>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              {p.uid || `ID: ${p.id}`}
                            </span>
                          </div>
                          <PlusCircle size={20} className="text-zinc-300 group-hover:text-primary-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* SELECTED PATIENT DISPLAY */
                <div className="bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/20 rounded-2xl p-5 flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary-600 uppercase mb-0.5">Selected Patient</p>
                      <p className="text-lg font-black text-zinc-900 dark:text-white">{selectedPatient.full_name || `${selectedPatient.first_name} ${selectedPatient.last_name}`}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedPatient(null)} className="p-3 text-zinc-400 hover:text-rose-500">
                    <X size={20} />
                  </button>
                </div>
              )}
            </section>

            {/* 2. DOCTOR SELECTION */}
            <section className="space-y-6">
              <h2 className={sectionTitleClasses}>
                <span className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">2</span>
                Select Physician
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctors.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-5 text-left rounded-2xl border transition-all ${selectedDoctorId === doc.id ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-xl" : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-black">{doc.name}</p>
                        <p className="text-[10px] opacity-60 font-black uppercase tracking-widest mt-1">{doc.department || 'General'}</p>
                      </div>
                      {selectedDoctorId === doc.id && <Check size={16} strokeWidth={4} className="text-primary-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. DETAILS (Date, Time, Price, Reason) */}
            <section className="space-y-6">
              <h2 className={sectionTitleClasses}>
                <span className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-[10px]">3</span>
                Appointment Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Date */}
                <div>
                  <label className={labelClasses}>Date *</label>
                  <div className={inputContainerClasses}>
                    <Calendar size={18} className="text-zinc-400" />
                    <input type="date" className={inputBaseClasses} required value={date} onChange={e => setDate(e.target.value)} />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className={labelClasses}>Arrival Time *</label>
                  <div className={inputContainerClasses}>
                    <Clock size={18} className="text-zinc-400" />
                    <input type="time" className={inputBaseClasses} required value={time} onChange={e => setTime(e.target.value)} />
                  </div>
                </div>

                {/* Price (New Field) */}
                <div>
                  <label className={labelClasses}>Consultation Price</label>
                  <div className={inputContainerClasses}>
                    <DollarSign size={18} className="text-zinc-400" />
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0"
                      placeholder="0.00" 
                      className={inputBaseClasses} 
                      value={price} 
                      onChange={e => setPrice(e.target.value)} 
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className={labelClasses}>Reason</label>
                  <div className={inputContainerClasses}>
                    <FileText size={18} className="text-zinc-400" />
                    <input type="text" className={inputBaseClasses} value={reason} onChange={e => setReason(e.target.value)} placeholder="Consultation reason..." />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 px-8 py-6 flex items-center justify-end border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="submit"
              disabled={submitLoading || !selectedPatient || !selectedDoctorId || isOffline}
              className="button-primary flex items-center gap-3 py-4 px-10 shadow-xl bg-gradient-to-tr from-rose-500 to-pink-500 border-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitLoading ? <Loader2 size={20} className="animate-spin" /> : <ClipboardCheck size={20} />}
              <span>CONFIRM BOOKING</span>
              <ArrowRight size={18} className="opacity-50" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointmentView;