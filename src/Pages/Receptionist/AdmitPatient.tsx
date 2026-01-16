import React, { useState } from "react";
import {
  Bed,
  Calendar,
  DollarSign,
  FileText,
  ChevronRight,
  ArrowRight,
  Loader2,
  X,
  User,
  Activity
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const PatientAdmissionView = ({ patient = { first_name: "John", last_name: "Doe", patient_uid: "P-10023", gender: "male" } }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bedId: "",
    admissionDate: new Date().toISOString().split('T')[0],
    reason: "",
    fee: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const getInitials = (f, l) => `${f.charAt(0)}${l.charAt(0)}`.toUpperCase();

  const labelClasses = "text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 block ml-1";
  const inputContainerClasses = "flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 focus-within:border-primary-500 transition-all focus-within:ring-4 focus-within:ring-primary-500/10";
  const inputBaseClasses = "w-full py-3.5 bg-transparent text-sm font-bold text-zinc-900 dark:text-white outline-none placeholder:text-zinc-400 placeholder:font-medium";

  return (
    <div className="p-8 flex flex-col h-full animate-in fade-in duration-500">
      {/* 1. Header Section */}
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
       <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <Breadcrumbs
            items={[
              { label: "Receptionist" },
              { label: "Admissions" },
              { label: "Admit Patient" },
            ]}
          />
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
            Patient Admission
          </h1>
          <p className="text-sm text-zinc-500 mt-2 font-medium">
            Assign a bed and record admission details for inpatient care.
          </p>
        </div>
        </div>
      </header>

      {/* Main Content Card */}
      <div className="card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col">
        
        {/* Patient Summary Header */}
        <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20 rotate-3">
              <span className="-rotate-3">{getInitials(patient.first_name, patient.last_name)}</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                {patient.first_name} {patient.last_name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-md tracking-widest uppercase">
                  {patient.patient_uid}
                </span>
                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                <span className="text-xs font-bold text-zinc-500 capitalize">{patient.gender}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 w-fit">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Admission Pending</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            
            {/* Bed Selection */}
            <div className="space-y-1">
              <label className={labelClasses}>Assign Bed <span className="text-rose-500">*</span></label>
              <div className={inputContainerClasses}>
                <Bed size={18} className="text-zinc-400" strokeWidth={2.5} />
                <select className={inputBaseClasses + " appearance-none cursor-pointer"}>
                  <option value="">Choose an Available Bed</option>
                  <option value="1">Bed 101 (General)</option>
                  <option value="2">Bed 102 (ICU)</option>
                  <option value="3">Bed 205 (Emergency)</option>
                </select>
              </div>
            </div>

            {/* Admission Date */}
            <div className="space-y-1">
              <label className={labelClasses}>Admission Date <span className="text-rose-500">*</span></label>
              <div className={inputContainerClasses}>
                <Calendar size={18} className="text-zinc-400" strokeWidth={2.5} />
                <input
                  type="date"
                  defaultValue={formData.admissionDate}
                  className={inputBaseClasses}
                  required
                />
              </div>
            </div>

            {/* Reason for Admission */}
            <div className="md:col-span-2 space-y-1">
              <label className={labelClasses}>Reason for Admission <span className="text-rose-500">*</span></label>
              <div className={inputContainerClasses}>
                <FileText size={18} className="text-zinc-400" strokeWidth={2.5} />
                <input
                  type="text"
                  placeholder="e.g. Post-operative observation, Severe dehydration..."
                  className={inputBaseClasses}
                  required
                />
              </div>
            </div>

            {/* Observation Fee */}
            <div className="space-y-1">
              <label className={labelClasses}>
                Observation Fee <span className="lowercase font-medium opacity-60">(Optional)</span>
              </label>
              <div className={inputContainerClasses}>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={16} strokeWidth={3} />
                </div>
                <input
                  type="number"
                  placeholder="0.00"
                  className={inputBaseClasses}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-end items-center gap-4">
            <button
              type="button"
              className="w-full md:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full md:w-auto flex items-center justify-center gap-3 py-4 px-10 shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" strokeWidth={3} />
                  <span>PROCESSING...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={20} strokeWidth={3} />
                  <span>CONFIRM ADMISSION</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientAdmissionView;