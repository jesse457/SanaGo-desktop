import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight, X, Loader2, Play, CheckCircle, WifiOff, RefreshCw } from "lucide-react";
import { getHours, getMinutes, format, addDays, isSameDay, subDays, startOfToday } from "date-fns";
import { apiClient } from "../../services/authService";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Import the hook created previously

const DASHBOARD_CACHE_PREFIX = "doctor_schedule_";

// --- Types ---
interface APIAppointment {
  id: number;
  number: number;
  raw_status: string;
  status_label: string; 
  status_color: "yellow" | "green" | "red" | "blue";
  patientName: string;
  patient_id: number;
  time: string;
  type: string;
  notes: string | null;
}

interface APIGroup {
  hourInt: number;
  timeSlot: string;
  hourRange: string;
  totalPatients: number;
  patients: APIAppointment[];
  hasActive: boolean;
}

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<APIGroup | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Prepare Fetch Function for the Hook
  // We use useCallback so the function reference doesn't change on every render
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  const fetchAppointmentsFn = useCallback(async () => {
    const res = await apiClient.get<{ data: APIGroup[] }>(`/doctor/appointments`, {
      params: { date: dateKey }
    });
    return res.data.data;
  }, [dateKey]);

  // 2. Implement Offline Sync Hook
  const { 
    data: appointmentGroups, 
    isLoading, 
    isSyncing, 
    error, 
    refetch 
  } = useOfflineSync<APIGroup[]>({
    key: `${DASHBOARD_CACHE_PREFIX}${dateKey}`, // Unique key per date
    fetchFn: fetchAppointmentsFn,
    autoRefresh: true,
    refreshInterval: 120000 // 2 minutes
  });

  // 3. Reactive Modal Update
  // If the data updates in the background (polling) while the modal is open,
  // update the modal content immediately.
  useEffect(() => {
    if (modalOpen && selectedGroup && appointmentGroups) {
      const updated = appointmentGroups.find(g => g.hourInt === selectedGroup.hourInt);
      if (updated) {
        setSelectedGroup(updated);
      }
    }
  }, [appointmentGroups, modalOpen, selectedGroup]);

  // 4. Handle Actions (Start/End)
  const handleAction = async (id: number, action: "start" | "end") => {
    setProcessingId(id);
    try {
      await apiClient.patch(`/doctor/appointments/${id}/${action}`);
      toast.success(`Consultation ${action === 'start' ? 'started' : 'completed'}`);
      
      // Force an immediate refresh from server to update UI state
      await refetch(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const dates = Array.from({ length: 28 }, (_, i) => addDays(subDays(startOfToday(), 2), i));
  const hasData = appointmentGroups && appointmentGroups.length > 0;

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* HEADER */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 z-20">
        <div className="px-8 py-6 flex justify-between items-center">
          <div>
            <Breadcrumbs items={[{ label: "Doctor" }, { label: "Schedule" }]} />
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
                Daily Timeline
              </h1>
              
              {/* Status Indicators */}
              {error && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-rose-100 text-rose-600 px-2 py-1 rounded-md">
                  <WifiOff size={12} /> Offline Mode
                </span>
              )}
              {isSyncing && !isLoading && (
                 <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-indigo-500 animate-pulse">
                   <RefreshCw size={12} className="animate-spin" /> Syncing...
                 </span>
              )}
            </div>
          </div>
          {!isSameDay(selectedDate, new Date()) && (
            <button onClick={() => setSelectedDate(new Date())} className="text-[10px] font-black uppercase bg-indigo-500 text-white px-6 py-2.5 rounded-2xl">Today</button>
          )}
        </div>

        {/* Date Strip */}
        <div className="relative group border-t border-zinc-100 dark:border-zinc-800/50 py-4">
          <div className="flex overflow-x-auto no-scrollbar gap-3 px-8">
            {dates.map((d, i) => {
              const active = isSameDay(d, selectedDate);
              return (
                <button key={i} onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border ${
                    active ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/30" : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                  }`}
                >
                  <span className={`text-[9px] font-black uppercase mb-1 ${active ? "text-indigo-100" : "text-zinc-400"}`}>{format(d, "EEE")}</span>
                  <span className="text-xl font-black">{format(d, "d")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* TIMELINE */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto relative p-8 app-scrollbar">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-3">
            <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
            <p className="text-sm font-bold text-zinc-400">Loading schedule...</p>
          </div>
        ) : !hasData ? (
          <div className="flex flex-col h-full items-center justify-center text-zinc-400">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={24} />
             </div>
             <p className="text-sm font-bold">No appointments for this day</p>
          </div>
        ) : (
          <div className="relative w-full max-w-5xl mx-auto" style={{ height: "1920px" }}>
            {/* Hour Markers */}
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="absolute w-full border-t border-zinc-200 dark:border-zinc-800 border-dashed flex gap-6" style={{ top: h * 80, height: 80 }}>
                <span className="text-[11px] font-bold text-zinc-400 w-12 -mt-2 font-mono">{h}:00</span>
              </div>
            ))}

            {/* Current Time Line */}
            {isSameDay(selectedDate, new Date()) && (
              <div className="absolute w-full z-20 flex items-center pointer-events-none" 
                   style={{ top: getHours(currentTime) * 80 + getMinutes(currentTime) * (80 / 60) }}>
                <div className="w-12 text-rose-500 text-[10px] font-black font-mono -ml-2">{format(currentTime, "HH:mm")}</div>
                <div className="flex-1 h-px bg-rose-500 relative shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              </div>
            )}

            {/* Render Hourly Groups */}
            {appointmentGroups?.map((group) => (
              <div key={group.hourInt}
                onClick={() => { setSelectedGroup(group); setModalOpen(true); }}
                className={`absolute left-20 right-0 z-10 cursor-pointer p-6 rounded-[2rem] border transition-all flex justify-between items-center group/card ${
                  group.hasActive ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5" : "bg-white dark:bg-zinc-900 border-zinc-200 shadow-sm hover:border-indigo-300"
                }`}
                style={{ top: group.hourInt * 80 + 10, height: 100 }}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-2 h-14 rounded-full ${group.hasActive ? "bg-amber-500" : "bg-indigo-500"}`} />
                  <div>
                    <h4 className="font-black text-xl tracking-tight text-zinc-900 dark:text-white">{group.hourRange}</h4>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{group.totalPatients} Patients</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {group.hasActive && (
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <ChevronRight size={20} className="text-zinc-400 group-hover/card:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        group={selectedGroup}
        onAction={handleAction}
        onClose={() => setModalOpen(false)}
        processingId={processingId}
      />
    </div>
  );
}

// ==========================================
// MODAL COMPONENT (Unchanged logic, just separated)
// ==========================================

const Modal = ({ isOpen, group, onAction, onClose, processingId }: any) => {
  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest block mb-1">Queue for {group.hourRange}</span>
            <h3 className="text-lg font-black text-zinc-900 dark:text-white">Patient Actions</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto app-scrollbar">
          {group.patients.map((p: APIAppointment) => {
            const isProcessing = processingId === p.id;
            
            const isCompleted = p.raw_status === "Completed";
            const isInProgress = p.raw_status === "In Consultation";

            return (
              <div key={p.id} className="flex justify-between items-center p-5 bg-zinc-50/50 dark:bg-zinc-950/30 border border-zinc-100 dark:border-zinc-800/50 rounded-3xl">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-400">
                     #{p.number}
                   </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.patientName}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">{p.time}</p>
                      <span className="text-[10px] text-zinc-300">•</span>
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest truncate max-w-[120px]">{p.type}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!isCompleted && (
                    <button
                      disabled={isProcessing}
                      onClick={() => onAction(p.id, isInProgress ? "end" : "start")}
                      className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all shadow-lg ${
                        isInProgress
                          ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
                      } disabled:opacity-50`}
                    >
                      {isProcessing ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : isInProgress ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                  )}

                  {isCompleted && (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <CheckCircle size={24} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};