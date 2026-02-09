import React, { useState } from "react";
import { 
  Clock, Calendar, Plus, Pencil, Trash2, 
  Loader2, ChevronLeft, ChevronRight, X,
  Users, ShieldCheck, Save
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";
import Dropdown from "../../components/Dropdown";

// --- 1. TYPES & INTERFACES ---
interface User {
  id: number;
  name: string;
  profile_picture?: string;
}

interface Shift {
  id: number;
  shift_type: "Morning" | "Day" | "Night";
  shift_date: string;
  start_time: string;
  end_time: string;
  user_count: number;
  user?: User[];
}

interface PaginatedResponse {
  data: Shift[];
  current_page: number;
  last_page: number;
  total: number;
}

// --- 2. INTEGRATED SERVICE LOGIC ---
const shiftService = {
  getShifts: async (page: number = 1): Promise<PaginatedResponse> => {
    const response = await apiClient.get(`/admin/shifts?page=${page}`);
    return response.data.data;
  },
  saveShift: async (data: any) => {
    const response = await apiClient.post("/admin/shifts", data);
    return response.data;
  },
  // NEW: Update Endpoint
  updateShift: async (id: number, data: any) => {
    const response = await apiClient.put(`/admin/shifts/${id}`, data);
    return response.data;
  },
  deleteShift: async (id: number) => {
    const response = await apiClient.delete(`/admin/shifts/${id}`);
    return response.data;
  }
};

const ShiftsView: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NEW: Track which shift is being edited (null = create mode)
  const [editingShiftId, setEditingShiftId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    shift_type: "Morning",
    shift_date: new Date().toISOString().split('T')[0],
    start_time: "08:00",
    end_time: "16:00",
  });

  const { data: paginatedData, isLoading, isSyncing, refetch } = useOfflineSync<PaginatedResponse>({
    key: `admin_shifts_page_${page}`,
    fetchFn: () => shiftService.getShifts(page),
  });

  const shifts = paginatedData?.data || [];

  // --- HANDLERS ---

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShiftId(null); // Reset edit mode
    setFormData({
      shift_type: "Morning",
      shift_date: new Date().toISOString().split('T')[0],
      start_time: "08:00",
      end_time: "16:00",
    });
  };

  const handleEditClick = (shift: Shift) => {
    setEditingShiftId(shift.id);
    setFormData({
      shift_type: shift.shift_type,
      // Ensure date format yyyy-mm-dd
      shift_date: new Date(shift.shift_date).toISOString().split('T')[0],
      // Ensure time format HH:mm (API might return HH:mm:ss)
      start_time: shift.start_time.slice(0, 5),
      end_time: shift.end_time.slice(0, 5),
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingShiftId) {
        // UPDATE MODE
        await shiftService.updateShift(editingShiftId, formData);
      } else {
        // CREATE MODE
        await shiftService.saveShift(formData);
      }
      
      handleCloseModal();
      refetch();
    } catch (err: any) {
        console.error("Validation Error:", err.response?.data?.errors);
        alert(err.response?.data?.message || "Error processing shift. Check validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    try {
      await shiftService.deleteShift(id);
      refetch();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      morning: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      afternoon: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
      night: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
    };
    return map[type.toLowerCase()] || map.morning;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <Breadcrumbs items={[ { label: "Duty Roster" }]} />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  Personnel Rostering System
                </h1>
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-xl">
                  Manage clinical coverage and departmental shifts. Monitor staff distribution across hospital wards to ensure 24/7 patient care standards.
                </p>
              </div>
              {(isSyncing || isLoading) && <Loader2 size={18} className="animate-spin text-primary-500 ml-2" />}
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingShiftId(null); // Ensure clean state for creation
              setIsModalOpen(true);
            }}
            className="button-primary flex items-center gap-2 py-3 px-6 shadow-xl h-fit"
          >
            <Plus size={20} strokeWidth={3} /> Add Shift Slot
          </button>
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="m-4 flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Shift Type</th>
                <th className="px-8 py-5">Time Window</th>
                <th className="px-8 py-5">On-Duty Count</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {shifts.map((s) => (
                <tr key={s.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                  <td className="px-8 py-5 font-black text-zinc-900 dark:text-white">
                    {new Date(s.shift_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest ${getTypeColor(s.shift_type)}`}>
                      {s.shift_type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      <Clock size={14} className="text-primary-500" />
                      {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-zinc-400"/>
                        <span className="text-xs font-black">{s.user_count} Staff</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEditClick(s)}
                        className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Shift Details"
                      >
                        <Pencil size={18} />
                      </button>
                      
                      {/* DELETE BUTTON */}
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove Shift"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {paginatedData && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              Total Recorded Slots: {paginatedData.total}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border dark:border-zinc-700 disabled:opacity-20 transition-all hover:bg-white dark:hover:bg-zinc-800"><ChevronLeft size={16}/></button>
              <button disabled={page === paginatedData.last_page} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border dark:border-zinc-700 disabled:opacity-20 transition-all hover:bg-white dark:hover:bg-zinc-800"><ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL (REUSED FOR CREATE & UPDATE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                  {editingShiftId ? "Update Shift Slot" : "Define Shift Slot"}
                </h2>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                  {editingShiftId ? "Edit existing schedule" : "New Duty Period"}
                </p>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"><X size={20}/></button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Shift Date</label>
                <input 
                  type="date" required
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 ring-primary-500 transition-all"
                  value={formData.shift_date}
                  onChange={e => setFormData({...formData, shift_date: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Shift Category</label>
                <Dropdown
                  label={formData.shift_type === "Morning" ? "Morning (AM)" : formData.shift_type === "Day" ? "Day (PM)" : "Night (Overnight)"}
                  items={[
                    {
                      label: "Morning (AM)",
                      onClick: () => setFormData({...formData, shift_type: "Morning"})
                    },
                    {
                      label: "Day (PM)",
                      onClick: () => setFormData({...formData, shift_type: "Day"})
                    },
                    {
                      label: "Night (Overnight)",
                      onClick: () => setFormData({...formData, shift_type: "Night"})
                    }
                  ]}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Punch In</label>
                  <input 
                    type="time" required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                    value={formData.start_time}
                    onChange={e => setFormData({...formData, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Punch Out</label>
                  <input 
                    type="time" required
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                    value={formData.end_time}
                    onChange={e => setFormData({...formData, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" onClick={handleCloseModal}
                  className="flex-1 py-4 text-sm font-black text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-[2] py-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : (
                    <>
                      <Save size={16} />
                      {editingShiftId ? "Update Shift" : "Authorize Shift"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftsView;