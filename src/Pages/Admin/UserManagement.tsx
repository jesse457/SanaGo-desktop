import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  Search,
  Trash2,
  Pencil,
  Mail,
  Phone,
  X,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  PhoneCall,
  ShieldCheck,
  Activity,
  CalendarRange,
  Briefcase
} from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";
import Dropdown from "../../components/Dropdown";

// --- Types ---
interface Shift {
  id: number;
  shift_type: string;
  shift_date: string;
  start_time: string;
  end_time: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone_number: string | null;
  user_picture: string | null;
  email_verified_at: string | null;
  is_active: boolean;
  upcoming_shift_id: number | null; // For the form selection
  latest_shift_info: {              // For the table display
    type: string;
    date: string;
  } | null;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();

  // --- List & Filter State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // --- Modal & Form State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);

  const [formData, setFormData] = useState({
    id: null as number | null,
    name: "",
    email: "",
    role: "doctor",
    phone_number: "",
    is_active: true,
    selected_shift_id: "" as string | number, // Mapped to backend payload
  });

  // --- Data Fetching (Users) ---
  const {
    data: paginatedData,
    isLoading,
    isSyncing,
    refetch,
  } = useOfflineSync<any>({
    key: `staff_list_p${page}_r${filterRole}_s${filterStatus}_q${search}`,
    fetchFn: () =>
      apiClient
        .get("/admin/users", {
          params: { page, search, role: filterRole, status: filterStatus },
        })
        .then((res) => res.data),
  });

  const users: User[] = paginatedData?.data || [];
  const meta = paginatedData?.meta || paginatedData;

  // --- Load Shifts for Modal ---
  useEffect(() => {
    if (isModalOpen) {
      apiClient
        .get("/admin/available-shifts")
        .then((res) => setAvailableShifts(res.data))
        .catch(() => toast.error("Could not load roster shifts"));
    }
  }, [isModalOpen]);

  // --- Action Handlers ---
  const handleEdit = (user: User) => {
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone_number: user.phone_number || "",
      is_active: Boolean(user.is_active),
      // Map API 'upcoming_shift_id' to Form 'selected_shift_id'
      selected_shift_id: user.upcoming_shift_id || "",
    });
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.put(`/admin/users/${formData.id}`, formData);
      toast.success("Staff profile updated successfully.");
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update staff.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!window.confirm(`Remove ${name} from the system?`)) return;
    try {
      await apiClient.delete(`/admin/users/${userId}`);
      toast.success("Staff member removed.");
      refetch();
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 relative">
      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Breadcrumbs items={[{ label: "Staff Roster" }]} />
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Staff Management
                </h2>
                {(isSyncing || isLoading) && (
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                )}
              </div>
              <p className="text-sm text-zinc-500 mt-2 font-medium">
                Manage Staff profiles, roles and assignments.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/users/create")}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
            >
              <UserPlus size={16} strokeWidth={3} /> Add New Staff
            </button>
          </div>

          {/* FILTERS */}
          <div className="px-6 py-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm"
                placeholder="Search staff by name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Dropdown
                className="w-full md:w-48"
                label={filterRole === "" ? "All Roles" : filterRole}
                items={[
                  { label: "All Roles", onClick: () => setFilterRole("") },
                  { label: "Doctor", icon: <ShieldCheck className="w-4 h-4" />, onClick: () => setFilterRole("doctor") },
                  { label: "Nurse", icon: <Activity className="w-4 h-4" />, onClick: () => setFilterRole("nurse") },
                  { label: "Receptionist", icon: <PhoneCall className="w-4 h-4" />, onClick: () => setFilterRole("receptionist") },
                  { label: "Lab-Technician", icon: <PhoneCall className="w-4 h-4" />, onClick: () => setFilterRole("lab-technician") },
                ]}
              />
              <Dropdown
                className="w-full md:w-48"
                label={filterStatus === "" ? "All Status" : filterStatus}
                items={[
                  { label: "All Status", onClick: () => setFilterStatus("") },
                  { label: "Active", icon: <div className="w-2 h-2 rounded-full bg-emerald-500" />, onClick: () => setFilterStatus("active") },
                  { label: "Inactive", icon: <div className="w-2 h-2 rounded-full bg-zinc-300" />, onClick: () => setFilterStatus("inactive") },
                ]}
              />
            </div>
          </div>
        </header>

        {/* --- DATA TABLE --- */}
        <div className="p-6">
          <div className="bg-white dark:bg-zinc-900 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
              <thead className="bg-zinc-50/50 dark:bg-zinc-950">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Member Info
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Latest Shift Assignment
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all"
                  >
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 shadow-inner">
                          {user.user_picture ? (
                            <img
                              src={user.user_picture}
                              className="w-full h-full rounded-2xl object-cover"
                              alt=""
                            />
                          ) : (
                            user.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-zinc-400" />
                        <span className="uppercase text-[10px] font-black text-blue-600 tracking-widest">
                          {user.role.replace("_", " ")}
                        </span>
                      </div>
                    </td>
                    
                    {/* --- LATEST SHIFT COLUMN --- */}
                    <td className="px-8 py-4">
                      {user.latest_shift_info ? (
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <CalendarRange size={16} />
                            </div>
                            <div className="flex flex-col">
                            <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                                {user.latest_shift_info.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                {user.latest_shift_info.date}
                            </span>
                            </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 opacity-50">
                            <CalendarRange size={16} className="text-zinc-400" />
                            <span className="text-[10px] font-bold text-zinc-400 italic">No shift assigned</span>
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-4">
                      <StatusBadge
                        active={user.is_active}
                        verified={!!user.email_verified_at}
                      />
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="px-8 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Showing {users.length} Staff Members
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= (meta?.last_page || 1)}
                  className="p-2 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL: UPDATE PROFILE & SHIFT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl rounded-[1.5rem] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30">
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Update Staff Profile
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateSubmit}
              className="p-8 space-y-8 max-h-[80vh] overflow-y-auto app-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Information Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-blue-600">
                    <User size={16} strokeWidth={3} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Personal Details
                    </h4>
                  </div>

                  <ModalField
                    label="Full Name"
                    value={formData.name}
                    onChange={(v: string) => setFormData({ ...formData, name: v })}
                    icon={User}
                  />
                  <ModalField
                    label="Professional Email"
                    value={formData.email}
                    onChange={(v: string) => setFormData({ ...formData, email: v })}
                    icon={Mail}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
                        Staff Role
                      </label>
                      <Dropdown
                        className="w-full"
                        buttonClassName="py-4 bg-zinc-50 dark:bg-zinc-800 border-transparent text-sm"
                        label={formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                        items={[
                          { label: "Doctor", icon: <ShieldCheck className="w-4 h-4" />, onClick: () => setFormData({ ...formData, role: "doctor" }) },
                          { label: "Nurse", icon: <Activity className="w-4 h-4" />, onClick: () => setFormData({ ...formData, role: "nurse" }) },
                          { label: "Receptionist", icon: <PhoneCall className="w-4 h-4" />, onClick: () => setFormData({ ...formData, role: "receptionist" }) },
                        ]}
                      />
                    </div>
                    <ModalField
                      label="Phone"
                      value={formData.phone_number}
                      onChange={(v: string) => setFormData({ ...formData, phone_number: v })}
                      icon={Phone}
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[2rem] flex items-center justify-between border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <p className="text-sm font-black text-zinc-900 dark:text-white">
                        Account Active
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                        Enable system access
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      className={`w-14 h-8 rounded-full relative transition-all duration-300 ${formData.is_active ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${formData.is_active ? "left-7" : "left-1"}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Roster Column */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Clock size={16} strokeWidth={3} />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Shift Assignment
                    </h4>
                  </div>

                  <div className="h-72 border border-zinc-200 dark:border-zinc-800 rounded-[1.0rem] overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-2 space-y-1 app-scrollbar">
                      {/* OPTION: NO SHIFT */}
                      <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${formData.selected_shift_id === "" ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-sm" : "border-transparent hover:bg-white dark:hover:bg-zinc-800"}`}>
                        <input
                          type="radio"
                          name="shift"
                          value=""
                          checked={formData.selected_shift_id === ""}
                          onChange={() => setFormData({ ...formData, selected_shift_id: "" })}
                          className="h-4 w-4 accent-blue-600"
                        />
                        <span className="text-xs font-bold text-zinc-400 italic">
                          No assigned shift
                        </span>
                      </label>

                      {/* OPTIONS: AVAILABLE SHIFTS */}
                      {availableShifts.map((shift) => (
                        <label
                          key={shift.id}
                          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${formData.selected_shift_id == shift.id ? "bg-white dark:bg-zinc-800 border-blue-200 dark:border-blue-900/30 shadow-md ring-1 ring-blue-500/20" : "border-transparent hover:bg-white dark:hover:bg-zinc-800"}`}
                        >
                          <input
                            type="radio"
                            name="shift"
                            value={shift.id}
                            checked={String(formData.selected_shift_id) === String(shift.id)}
                            onChange={() => setFormData({ ...formData, selected_shift_id: shift.id })}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-black text-zinc-900 dark:text-white">
                              {new Date(shift.shift_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.1em] mt-0.5">
                              {shift.shift_type} • {shift.start_time.slice(0, 5)} - {shift.end_time.slice(0, 5)}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-4 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}{" "}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

// --- Atomic UI Components ---

const ModalField = ({ label, icon: Icon, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <Icon
        size={14}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
      />
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-11 pr-4 py-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[0.5rem] text-sm font-bold focus:bg-white dark:focus:bg-zinc-900 focus:border-blue-500/30 outline-none transition-all shadow-sm"
      />
    </div>
  </div>
);

const StatusBadge = ({ active, verified }: { active: boolean; verified: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
      active && verified
        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
    }`}
  >
    <div className={`h-1.5 w-1.5 rounded-full ${active && verified ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
    {active && verified ? "Verified" : "Restricted"}
  </span>
);

export default UserManagement;