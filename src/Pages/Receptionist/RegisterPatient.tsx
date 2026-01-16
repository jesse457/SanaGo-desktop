import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Loader2,
  WifiOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/api/authService";

// --- Form Type Definition ---
interface PatientRegistrationForm {
  first_name: string;
  last_name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
}

const RegisterPatientView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isOffline] = useState(!navigator.onLine); // Basic online check

  // --- Form State ---
  const [formData, setFormData] = useState<PatientRegistrationForm>({
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
  });

  // --- Handlers ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOffline) {
      toast.error("Registration requires an active connection for secure encryption.");
      return;
    }

    setLoading(true);

    try {
      // POST /api/receptionist/patients
      // Note: Body keys match Laravel validation: first_name, last_name, etc.
      await apiClient.post("/receptionist/patients", formData);

      toast.success(`Patient ${formData.first_name} registered successfully!`);
      
      // Navigate back to the patient list
      setTimeout(() => navigate("/reception/patients"), 1000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Failed to register patient.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI Styling Classes ---
  const inputClasses = 
    "w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none placeholder:text-zinc-400 disabled:opacity-50";
  
  const labelClasses = 
    "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* 1. HEADER SECTION */}
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs
              items={[
                { label: "Receptionist" },
                { label: "Patients", path: "/reception/patients" },
                { label: "Register Patient" },
              ]}
            />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter flex items-center gap-3">
              Register New Patient
              {isOffline && <WifiOff className="text-rose-500 w-6 h-6" />}
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              {isOffline 
                ? "Connection lost. Registration is temporarily disabled." 
                : "Enter the patient's personal details to create a new medical record."}
            </p>
          </div>
        </div>
      </header>

      {/* 2. FORM CARD */}
      <div className="card-base shadow-xl m-5 overflow-hidden flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* First Name */}
            <div className="space-y-1">
              <label className={labelClasses}>First Name <span className="text-rose-500">*</span></label>
              <input
                name="first_name"
                type="text"
                placeholder="e.g. John"
                className={inputClasses}
                required
                value={formData.first_name}
                onChange={handleInputChange}
                disabled={loading || isOffline}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className={labelClasses}>Last Name <span className="text-rose-500">*</span></label>
              <input
                name="last_name"
                type="text"
                placeholder="e.g. Doe"
                className={inputClasses}
                required
                value={formData.last_name}
                onChange={handleInputChange}
                disabled={loading || isOffline}
              />
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className={labelClasses}>Age <span className="text-rose-500">*</span></label>
              <input
                name="age"
                type="number"
                placeholder="0"
                className={inputClasses}
                required
                value={formData.age}
                onChange={handleInputChange}
                disabled={loading || isOffline}
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className={labelClasses}>Gender <span className="text-rose-500">*</span></label>
              <select 
                name="gender"
                className={inputClasses + " appearance-none cursor-pointer"}
                required
                value={formData.gender}
                onChange={handleInputChange}
                disabled={loading || isOffline}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className={labelClasses}>Phone Number <span className="text-rose-500">*</span></label>
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 focus-within:border-primary-500 transition-colors">
                <Phone size={16} className="text-zinc-400" />
                <input
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="w-full py-3 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none disabled:opacity-50"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={loading || isOffline}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className={labelClasses}>
                Email Address <span className="lowercase font-medium opacity-60">(Optional)</span>
              </label>
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 focus-within:border-primary-500 transition-colors">
                <Mail size={16} className="text-zinc-400" />
                <input
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full py-3 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none disabled:opacity-50"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading || isOffline}
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClasses}>Residential Address <span className="text-rose-500">*</span></label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-zinc-400" />
                <textarea
                  name="address"
                  rows={3}
                  placeholder="Street address, apartment, city..."
                  className={inputClasses + " pl-12 resize-none"}
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading || isOffline}
                ></textarea>
              </div>
            </div>
          </div>

          {/* 3. FORM FOOTER */}
          <div className="mt-12 pt-8 border-t border-zinc-50 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-zinc-400">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Secure Encrypted Record</span>
             </div>
            
            <button
              type="submit"
              disabled={loading || isOffline}
              className="button-primary w-full md:w-auto flex items-center justify-center gap-3 py-4 px-10 shadow-xl bg-gradient-to-tr from-rose-500 to-pink-500 border-none disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" strokeWidth={3} />
                  <span>REGISTERING...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} strokeWidth={3} />
                  <span>CREATE PATIENT RECORD</span>
                  <ArrowRight size={18} className="ml-2 opacity-50" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatientView;