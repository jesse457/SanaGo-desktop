import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Calendar,
  Clock,
  CalendarDays,
  Trash2,
  Check,
  XCircle,
  WifiOff,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../services/api/authService";
import { storageService } from "../../services/api/StorageService";
import Breadcrumbs from "../../components/Breadcrumbs";

// --- Types ---
interface Appointment {
  id: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: string;
  queue_position: number | null;
  patient: {
    id: number;
    full_name: string;
    // Helper for UI initials
    first_name: string; 
    last_name: string;
    uid?: string; // If your API sends patient ID string (e.g., P-1001)
  };
  doctor: {
    id: number;
    name: string;
    department?: { name: string };
  };
}

const AppointmentsView = () => {
  // --- State ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  // --- Effects ---
  
  // Debounce Search & Filter
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, statusFilter, dateFilter]);

  // --- API Actions ---

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);

      // GET /api/receptionist/appointments
      const response = await apiClient.get(`/receptionist/appointments?${params.toString()}`);
      
      const data = response.data.data; // Assuming Laravel Resource Collection wraps in 'data'
      setAppointments(data);
      setIsOffline(false);

      // Cache default view for offline usage
      if (!search && !statusFilter && !dateFilter) {
        await storageService.save(storageService.KEYS.APPOINTMENTS_LIST, data);
      }

    } catch (error) {
      console.error("Network failed", error);
      
      // Offline Fallback
      const cachedData = await storageService.get<Appointment[]>(storageService.KEYS.APPOINTMENTS_LIST);
      if (cachedData) {
        setAppointments(cachedData);
        setIsOffline(true);
        toast.warning("Network error. Showing cached appointments.");
      } else {
        setAppointments([]);
        toast.error("Failed to load appointments.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    if (isOffline) return toast.error("Cannot cancel while offline.");
    
    try {
      // PATCH /api/receptionist/appointments/{id}/cancel
      await apiClient.patch(`/receptionist/appointments/${id}/cancel`);
      toast.success("Appointment canceled");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to cancel appointment");
    }
  };

  const handleConfirmCheckIn = async (id: number) => {
    if (isOffline) return toast.error("Cannot check-in while offline.");

    try {
      // PATCH /api/receptionist/appointments/{id}/confirm
      await apiClient.patch(`/receptionist/appointments/${id}/confirm`);
      toast.success("Check-in confirmed. Patient added to queue.");
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to confirm check-in");
    }
  };

  const openReschedule = (apt: Appointment) => {
    setSelectedAppointment(apt);
    setRescheduleDate(apt.date);
    setRescheduleTime(apt.time);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async () => {
    if (isOffline) return toast.error("Cannot reschedule while offline.");
    if (!selectedAppointment) return;

    try {
      // PUT /api/receptionist/appointments/{id} (Standard Resource Update)
      await apiClient.put(`/receptionist/appointments/${selectedAppointment.id}`, {
        date: rescheduleDate,
        time: rescheduleTime
      });
      toast.success("Rescheduled successfully");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch (error) {
      toast.error("Failed to reschedule");
    }
  };

  // --- UI Helpers ---

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      waiting: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      "in consultation": "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      canceled: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
      scheduled: "bg-zinc-50 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700",
    };
    return map[status.toLowerCase()] || map.scheduled;
  };

  const filterInputClasses = "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition-all disabled:opacity-50";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* 1. HEADER SECTION */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Receptionist" }, { label: "Appointments" }]} />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Manage Appointments
              {isOffline && <WifiOff className="text-rose-500 w-6 h-6 animate-pulse" />}
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              {isOffline 
                ? <span className="text-rose-500 font-bold">OFFLINE MODE - ACTIONS DISABLED</span> 
                : "Monitor patient flow, manage schedules, and track consultation status."}
            </p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={fetchAppointments}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                title="Refresh Data"
            >
                <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <Link to="/reception/book-appointment">
                <button className="button-primary flex items-center gap-2 py-3.5 px-6 shadow-xl bg-gradient-to-tr from-rose-500 to-pink-500 border-none">
                <Plus size={20} strokeWidth={3} /> Book Appointment
                </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. FILTERS BAR */}
      <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search Patient (Name, ID)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isOffline}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-zinc-400 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            disabled={isOffline}
            className={filterInputClasses} 
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            disabled={isOffline}
            className={filterInputClasses}
          >
            <option value="">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">In Consultation</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
          </select>
          <button 
             onClick={() => { setSearch(""); setDateFilter(""); setStatusFilter(""); }}
             className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* 3. TABLE VIEW */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-10">
                <tr>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Assigned Doctor</th>
                <th className="px-8 py-5">Date & Time</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Queue</th>
                <th className="px-8 py-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800 overflow-y-auto">
                {loading && appointments.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-zinc-400"><Loader2 className="animate-spin mx-auto mb-2" /> Loading...</td></tr>
                ) : appointments.length === 0 ? (
                    <tr><td colSpan={6} className="p-12 text-center text-zinc-400 font-bold text-sm">No appointments found matching your criteria.</td></tr>
                ) : (
                    appointments.map((apt) => (
                    <tr key={apt.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                        <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-black text-zinc-500 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            {getInitials(apt.patient.full_name)}
                            </div>
                            <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                {apt.patient.full_name}
                            </p>
                            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight">
                                {apt.patient.uid || `ID: ${apt.patient.id}`}
                            </p>
                            </div>
                        </div>
                        </td>
                        <td className="px-8 py-5">
                        <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                            {apt.doctor.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            {apt.doctor.department?.name || 'General'}
                        </p>
                        </td>
                        <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-black text-zinc-700 dark:text-zinc-300">
                            <Calendar size={14} className="text-zinc-400" />
                            {apt.date}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase">
                            <Clock size={12} />
                            {apt.time}
                            </div>
                        </div>
                        </td>
                        <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest uppercase ${getStatusStyle(apt.status)} ${apt.status === "In Consultation" ? "animate-pulse" : ""}`}>
                            {apt.status}
                        </span>
                        </td>
                        <td className="px-8 py-5 text-center">
                        {apt.queue_position ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            {apt.queue_position}
                            </span>
                        ) : (
                            <span className="text-zinc-300 dark:text-zinc-700 text-xl font-black">•</span>
                        )}
                        </td>
                        <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                            
                            {/* Check In */}
                            {apt.status === "Scheduled" && (
                            <button 
                                onClick={() => handleConfirmCheckIn(apt.id)}
                                disabled={isOffline}
                                className="p-2 bg-zinc-50 dark:bg-zinc-800 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition-colors disabled:opacity-50"
                                title="Confirm Check-In"
                            >
                                <Check size={18} strokeWidth={3} />
                            </button>
                            )}
                            
                            {/* Reschedule */}
                            {apt.status !== 'Canceled' && apt.status !== 'Completed' && (
                                <button
                                onClick={() => openReschedule(apt)}
                                disabled={isOffline}
                                className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-600 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm disabled:opacity-50"
                                title="Reschedule"
                                >
                                <CalendarDays size={18} />
                                </button>
                            )}

                            {/* Cancel */}
                            {apt.status !== 'Canceled' && apt.status !== 'Completed' && (
                                <button 
                                onClick={() => handleCancel(apt.id)}
                                disabled={isOffline}
                                className="p-2 bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm disabled:opacity-50"
                                title="Cancel Appointment"
                                >
                                <XCircle size={18} />
                                </button>
                            )}
                        </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* 4. RESCHEDULE MODAL */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowRescheduleModal(false)} />
          <div className="relative w-full max-w-md card-base shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Reschedule</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Select a new time slot for <span className="text-primary-500">{selectedAppointment.patient.full_name}</span>.
                  </p>
                </div>
                <button onClick={() => setShowRescheduleModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">New Date</label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-sm text-zinc-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">New Time</label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 font-bold text-sm text-zinc-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowRescheduleModal(false)} className="flex-1 py-3.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button 
                    onClick={handleRescheduleSubmit}
                    className="flex-[2] button-primary py-3.5 px-6 shadow-lg"
                  >
                    Confirm Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;