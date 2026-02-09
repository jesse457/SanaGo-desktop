import React, { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  CalendarDays,
  Phone,
  Mail,
  X,
  Loader2,
  CheckCircle2,
  MapPin,
  WifiOff,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import Dropdown from "../../components/Dropdown";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "../../services/authService";
import { storageService } from "../../services/StorageService";

// --- Interfaces ---
interface Patient {
  id: number;
  uid: string;
  first_name: string;
  last_name: string;
  full_name: string;
  initials: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  address: string;
  registered_since: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const PatientManagementView = () => {
  // State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // --- API Functions ---

  const fetchPatients = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/receptionist/patients`, {
        params: {
          query: search,
          page: pageNum,
          per_page: 10,
        },
      });

      // Laravel Resource Collection structure: { data: [...], meta: {...} }
      const { data, meta } = response.data;
      setPatients(data);
      setMeta({
        current_page: meta.current_page,
        last_page: meta.last_page,
        total: meta.total,
      });
      setIsOffline(false);

      // Cache default first page
      if (!search && pageNum === 1) {
        await storageService.save(storageService.KEYS.PATIENT_LIST, data);
      }
    } catch (error) {
      const cached = await storageService.get<Patient[]>(storageService.KEYS.PATIENT_LIST);
      if (cached) {
        setPatients(cached);
        setIsOffline(true);
        toast.warning("Network offline. Showing cached records.");
      } else {
        toast.error("Failed to load patient records.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchPatients(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This will permanently delete the record.")) return;

    try {
      await apiClient.delete(`/receptionist/patients/${id}`);
      toast.success("Patient record deleted.");
      fetchPatients(page);
    } catch (error) {
      toast.error("Delete failed. Ensure you have permissions.");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsUpdating(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      await apiClient.put(`/receptionist/patients/${selectedPatient.id}`, data);
      toast.success("Patient updated successfully.");
      setShowEditModal(false);
      fetchPatients(page);
    } catch (error) {
      toast.error("Update failed. Check your connection.");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Styles ---
  const labelClasses = "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";
  const inputClasses = "w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none placeholder:text-zinc-400 disabled:opacity-50";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* 1. HEADER */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Receptionist" }, { label: "Patient Management" }]} />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Patient Management {isOffline && <WifiOff className="text-rose-500 w-6 h-6 animate-pulse" />}
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">View, search, and manage secure patient records.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchPatients(page)}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <Link to="/reception/register-patient">
              <button className="button-primary flex items-center gap-2 py-3.5 px-6 shadow-xl bg-gradient-to-tr from-rose-500 to-pink-500 border-none">
                <UserPlus size={20} strokeWidth={3} /> New Patient
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. FILTERS BAR */}
      <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID, or phone number..."
            className={inputClasses + " pl-11"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isOffline}
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <Trash2 size={14} /> Clear Search
          </button>
        )}
      </div>

      {/* 3. TABLE VIEW */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] border-b border-zinc-100 dark:border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-5">Patient Details</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5 text-center">Age/Gender</th>
                <th className="px-8 py-5">Registered Since</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {loading && patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-zinc-400" /></td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-500 font-bold">No patient records found.</td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center text-xs font-black shadow-lg">
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {p.full_name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-tight bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded w-fit mt-1">
                            {p.uid}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">{p.phone}</p>
                        <p className="text-[10px] text-zinc-400 font-bold tracking-tight">{p.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 uppercase">
                          {p.age} Yrs
                        </span>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{p.gender}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-black text-zinc-700 dark:text-zinc-300">
                        <CalendarDays size={14} className="text-zinc-400" />
                        {p.registered_since}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button
                          onClick={() => { setSelectedPatient(p); setShowEditModal(true); }}
                          disabled={isOffline}
                          className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-600 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm transition-colors disabled:opacity-50"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isOffline}
                          className="p-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-400 hover:text-rose-600 rounded-xl border border-rose-100 dark:border-rose-900/40 shadow-sm disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Showing Page {meta.current_page} of {meta.last_page} ({meta.total} records)
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900 disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. EDIT MODAL */}
      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="relative w-full max-w-2xl card-base shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">Update Patient</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">ID: {selectedPatient.uid}</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-8 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>First Name</label>
                  <input name="first_name" type="text" defaultValue={selectedPatient.first_name} className={inputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>Last Name</label>
                  <input name="last_name" type="text" defaultValue={selectedPatient.last_name} className={inputClasses} required />
                </div>
                <div>
                  <label className={labelClasses}>Age</label>
                  <input name="age" type="number" defaultValue={selectedPatient.age} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Gender</label>
                  <Dropdown
                    label={selectedPatient.gender || "Select Gender"}
                    items={[
                      { label: "Male", onClick: () => { /* Handle gender change */ } },
                      { label: "Female", onClick: () => { /* Handle gender change */ } },
                      { label: "Other", onClick: () => { /* Handle gender change */ } }
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className={labelClasses}>Phone</label>
                  <input name="phone" type="tel" defaultValue={selectedPatient.phone} className={inputClasses} />
                </div>
                <div>
                  <label className={labelClasses}>Email</label>
                  <input name="email" type="email" defaultValue={selectedPatient.email} className={inputClasses} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Residential Address</label>
                  <textarea name="address" rows={3} defaultValue={selectedPatient.address} className={inputClasses + " resize-none"} />
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating} className="button-primary flex items-center gap-3 py-4 px-10 shadow-xl">
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagementView;