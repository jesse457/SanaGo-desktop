import React, { useState, useEffect, useRef } from "react";
import {
  Bed as BedIcon,
  Calendar,
  FileText,
  ArrowRight,
  Loader2,
  Activity,
  WifiOff,
  ChevronDown,
  Search,
  Check,
  RefreshCcw,
  MapPin,
  Tag
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { useOfflineSync } from "../../hooks/useOfflineSync";

interface Bed {
  id: number;
  code: string;
  ward_name: string;
  type: string;
}

// --- Enhanced Bed Selection Dropdown ---
const BedSelect = ({ 
  options = [], // Default to empty array
  value, 
  onChange, 
  disabled,
  onRefresh,
  isRefreshing
}: { 
  options: Bed[], 
  value: string, 
  onChange: (val: string) => void,
  disabled: boolean,
  onRefresh: () => void,
  isRefreshing: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Defensive Check: Ensure options is actually an array before trying to use .find()
  const safeOptions = Array.isArray(options) ? options : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safe find
  const selectedBed = safeOptions.find((b) => b.id.toString() === value);
  
  // Safe filter
  const filteredOptions = safeOptions.filter(bed => 
    (bed.code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (bed.ward_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (bed.type?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full z-[50]" ref={dropdownRef}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full py-3 px-4 rounded-xl border transition-all cursor-pointer bg-white dark:bg-zinc-900/50 
          ${isOpen ? 'border-violet-500 ring-2 ring-violet-500/10' : 'border-zinc-200 dark:border-zinc-700'} 
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-zinc-300 dark:hover:border-zinc-600'}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <BedIcon size={18} className={selectedBed ? "text-violet-500" : "text-zinc-400"} />
          <div className="flex flex-col items-start overflow-hidden text-left">
            {selectedBed ? (
              <>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate w-full tracking-tight">
                  {selectedBed.code} <span className="text-zinc-400 font-normal ml-1">— {selectedBed.ward_name}</span>
                </span>
                <span className="text-[10px] uppercase font-black text-violet-500">{selectedBed.type}</span>
              </>
            ) : (
              <span className="text-sm text-zinc-400">Choose an available bed...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 border-l pl-3 border-zinc-100 dark:border-zinc-800 ml-2">
            <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input 
                type="text" 
                placeholder="Search code, ward, or type..." 
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs outline-none focus:ring-1 focus:ring-violet-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); onRefresh(); }}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
              title="Refresh availability"
            >
              <RefreshCcw size={14} className={isRefreshing ? "animate-spin text-violet-500" : ""} />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto p-2 custom-scrollbar grid grid-cols-1 gap-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((bed) => (
                <div
                  key={bed.id}
                  onClick={() => {
                    onChange(bed.id.toString());
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    value === bed.id.toString() 
                      ? "bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20" 
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${value === bed.id.toString() ? 'bg-violet-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:bg-white dark:group-hover:bg-zinc-700'}`}>
                        <BedIcon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-bold text-sm ${value === bed.id.toString() ? 'text-violet-700 dark:text-violet-300' : 'text-zinc-700 dark:text-zinc-200'}`}>
                        {bed.code}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <MapPin size={10} /> {bed.ward_name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 font-bold uppercase tracking-tighter">
                            {bed.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  {value === bed.id.toString() && <Check size={16} className="text-violet-600" />}
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className="text-xs text-zinc-400">No matching beds found.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main View Component ---
const PatientAdmissionView = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();

  const passedPatient = state?.patient;
  const passedRequest = state?.request;

  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    bed_id: "",
    admission_date: new Date().toISOString().split("T")[0],
    reason_for_admission: passedRequest?.reason || "",
    observation_fee: "",
  });

  const { data, isLoading, error, refetch } = useOfflineSync<Bed[]>({
    key: "available_beds_list",
    fetchFn: async () => {
      const response = await apiClient.get(`/receptionist/beds/available`);
      // 2. Ensure we return an array. If API returns wrapped object, access it here.
      const result = response.data?.data || response.data;
      return Array.isArray(result) ? result : [];
    },
    autoRefresh: true,
    refreshInterval: 60000 
  });

  // 3. Double Check: Force availableBeds to be an array even if data is null/undefined/object
  const availableBeds = Array.isArray(data) ? data : []; 
  const isOffline = !!error; 

  useEffect(() => {
    if (!passedPatient || !passedRequest) {
      toast.error("Session lost. Please select the patient again.");
      navigate("/reception/admissions");
    }
  }, [passedPatient, passedRequest, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) return toast.error("Cannot process admission while offline.");
    if (!formData.bed_id) return toast.error("Please select a bed.");

    setSubmitLoading(true);
    try {
      await apiClient.post("/receptionist/admissions", {
        ...formData,
        patient_id: passedPatient.id,
        admission_request_id: requestId,
        doctor_id: passedRequest.doctor_id || 1,
      });

      toast.success("Admission successful!");
      navigate("/reception/admissions");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process admission.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const labelClasses = "text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] mb-2 block ml-1";
  const inputContainerClasses = "flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/5 transition-all";
  const inputBaseClasses = "w-full py-3.5 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:font-normal placeholder:text-zinc-400";

  // Loading state (ensure we don't block if we have cached data, only block if loading AND no data)
  if (isLoading && !data) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-950">
        <div className="relative">
            <Loader2 className="animate-spin text-violet-500" size={48} />
            <BedIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-200" size={16} />
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 animate-pulse">Syncing Inventory...</span>
      </div>
    );
  }

  if (!passedPatient || !passedRequest) return null;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/50 dark:bg-zinc-950 animate-in fade-in duration-500">
      <header className="sticky top-0 flex-shrink-0 z-[60] border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admissions", path: "/reception/admissions" },
                { label: "Process Bed Assignment" },
              ]}
            />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
              Process Admission {isOffline && <WifiOff className="text-rose-500" size={20} />}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 md:p-8">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Patient Banner */}
          <div className="px-8 py-8 bg-zinc-900 dark:bg-zinc-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-violet-500 flex items-center justify-center font-black text-2xl shadow-2xl shadow-violet-500/20 rotate-3 group hover:rotate-0 transition-transform cursor-default">
                {passedPatient.first_name[0]}{passedPatient.last_name[0]}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">{passedPatient.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-300 border border-white/10">
                    {passedPatient.patient_uid}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Activity size={14} className="text-emerald-400" /> 
                    Requested by Dr. {passedRequest.doctor.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Bed Selection - Taking full width or prominent spot */}
              <div className="md:col-span-1 space-y-1 relative">
                <label className={labelClasses}>Assign Ward & Bed <span className="text-rose-500">*</span></label>
                <BedSelect 
                  options={availableBeds} 
                  value={formData.bed_id} 
                  onChange={(val) => setFormData(prev => ({ ...prev, bed_id: val }))}
                  disabled={isLoading && availableBeds.length === 0}
                  onRefresh={() => refetch()}
                  isRefreshing={isLoading}
                />
                {availableBeds.length === 0 && !isLoading && (
                   <p className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold mt-2 ml-1">
                     <WifiOff size={12} /> No beds available or synced.
                   </p>
                )}
              </div>

              {/* Admission Date */}
              <div className="md:col-span-1 space-y-1">
                <label className={labelClasses}>Admission Date <span className="text-rose-500">*</span></label>
                <div className={inputContainerClasses}>
                  <Calendar size={18} className="text-zinc-400" />
                  <input
                    name="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={handleInputChange}
                    className={inputBaseClasses}
                    required
                  />
                </div>
              </div>

              {/* Reason for Admission */}
              <div className="md:col-span-2 space-y-1">
                <label className={labelClasses}>Reason for Admission <span className="text-rose-500">*</span></label>
                <div className={inputContainerClasses}>
                  <FileText size={18} className="text-zinc-400" />
                  <input
                    name="reason_for_admission"
                    type="text"
                    placeholder="Briefly describe the reason for hospitalization..."
                    className={inputBaseClasses}
                    value={formData.reason_for_admission}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Observation Fee */}
              <div className="md:col-span-1 space-y-1">
                <label className={labelClasses}>Initial Observation Fee</label>
                <div className={inputContainerClasses}>
                  <div className="flex items-center gap-2">
                    <Tag size={18} className="text-zinc-400" />
                    <span className="text-sm font-bold text-zinc-400">$</span>
                  </div>
                  <input
                    name="observation_fee"
                    type="number"
                    placeholder="0.00"
                    className={inputBaseClasses}
                    value={formData.observation_fee}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 ml-1">Leave empty if not applicable.</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="hidden md:flex items-center gap-2 text-zinc-400">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">System Ready</span>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 md:flex-none px-8 py-4 text-xs font-black uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                    >
                        Go Back
                    </button>
                    <button
                        type="submit"
                        disabled={submitLoading || isOffline || !formData.bed_id}
                        className="flex-1 md:flex-none button-primary flex items-center justify-center gap-3 py-4 px-10 shadow-2xl shadow-violet-500/20 bg-gradient-to-tr from-violet-600 to-indigo-600 border-none disabled:opacity-30 disabled:grayscale text-white rounded-2xl active:scale-95 transition-all"
                    >
                        {submitLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                        <span className="font-black text-xs tracking-widest uppercase">Confirm Admission</span>
                    </button>
                </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PatientAdmissionView;