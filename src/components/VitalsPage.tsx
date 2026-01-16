// components/VitalsPage
import React, { useState } from "react";
import {
  User,
  Calendar,
  Clock,
  Heart,
  Thermometer,
  Wind,
  Activity,
  AlertTriangle,
  CheckCircle2,
  History,
  ChevronDown,
} from "lucide-react";
import { cn } from "../utils/cn";

const VitalsPage = () => {
  const [activePatient, setActivePatient] = useState("PT-1024");

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header / Context Bar */}
      <header className="flex justify-between items-end mb-8 shrink-0">
        <div>
          <h1 className="heading-1">Record Vitals</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Daily rounds documentation for ICU Wing A.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-sm transition-all">
            <History size={14} /> View History
          </button>
          <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-lg text-primary-700 dark:text-primary-400 text-xs font-medium flex items-center gap-2">
            <Clock size={14} /> Shift: 07:00 - 19:00
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Patient Context (Sticky) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Patient Card */}
          <div className="card-base p-1">
            {/* Fake Command Palette Select */}
            <div className="relative">
              <select
                className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm rounded-lg p-3 pl-10 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                value={activePatient}
                onChange={(e) => setActivePatient(e.target.value)}
              >
                <option value="PT-1024">Johnathan Doe</option>
                <option value="PT-1025">Sarah Connor</option>
              </select>
              <User
                size={16}
                className="absolute left-3.5 top-3.5 text-zinc-400"
              />
              <ChevronDown
                size={14}
                className="absolute right-3.5 top-4 text-zinc-400"
              />
            </div>

            {/* Patient Details */}
            <div className="px-4 py-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Johnathan Doe
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5">
                    ID: #88392-AX • Male • 42y
                  </p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-100 dark:border-emerald-500/20">
                  Stable
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
                <DetailItem label="Room" value="304-A" />
                <DetailItem label="Admitted" value="Jan 4, 2026" />
                <DetailItem label="Diagnosis" value="Post-Op Recovery" full />
                <DetailItem
                  label="Allergies"
                  value="Penicillin, Peanuts"
                  full
                  warn
                />
              </div>
            </div>
          </div>

          {/* Previous Reading (Comparison) */}
          <div className="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 p-5 flex-1">
            <h4 className="text-label mb-4">Last Reading (4h ago)</h4>
            <div className="space-y-3">
              <HistoryRow label="BP" value="118/78" />
              <HistoryRow label="HR" value="72 bpm" />
              <HistoryRow label="Temp" value="36.8°C" />
              <HistoryRow label="SpO2" value="99%" />
            </div>
          </div>
        </div>

        {/* Right Column: Input Form */}
        <div className="col-span-12 lg:col-span-8 flex flex-col card-base overflow-hidden">
          <div className="flex-1 overflow-y-auto app-scrollbar p-8">
            <div className="space-y-8">
              {/* Section: Cardiovascular */}
              <Section title="Cardiovascular" icon={Heart}>
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup
                    label="Blood Pressure"
                    placeholder="120/80"
                    unit="mmHg"
                  />
                  <InputGroup label="Heart Rate" placeholder="72" unit="bpm" />
                </div>
              </Section>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* Section: Respiratory */}
              <Section title="Respiratory" icon={Wind}>
                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="SpO2 Levels" placeholder="98" unit="%" />
                  <InputGroup
                    label="Resp. Rate"
                    placeholder="16"
                    unit="breaths/m"
                  />
                </div>
              </Section>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* Section: General */}
              <Section title="General & Notes" icon={Thermometer}>
                <div className="grid grid-cols-3 gap-6 mb-6">
                  <InputGroup
                    label="Temperature"
                    placeholder="36.5"
                    unit="°C"
                  />
                  <InputGroup label="Weight" placeholder="--" unit="kg" />
                  <InputGroup label="Pain Level" placeholder="0-10" unit="" />
                </div>

                <div>
                  <label className="block text-label mb-2 normal-case tracking-normal text-zinc-700 dark:text-zinc-300">
                    Clinical Observations
                  </label>
                  <textarea
                    className="input-base h-24 p-3 resize-none text-sm placeholder:text-zinc-400"
                    placeholder="Enter specific notes regarding patient demeanor, complaints, or changes in condition..."
                  ></textarea>
                </div>
              </Section>

              {/* Abnormal Toggle */}
              <div className="flex items-center gap-3 p-3 bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-lg">
                <input
                  type="checkbox"
                  id="abnormal"
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                />
                <label
                  htmlFor="abnormal"
                  className="text-sm font-medium text-orange-800 dark:text-orange-300 cursor-pointer select-none"
                >
                  Flag reading as abnormal/critical
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
            <span className="text-xs text-zinc-400">Autosaved 2m ago</span>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                Cancel
              </button>
              <button className="button-primary flex items-center gap-2">
                <CheckCircle2 size={16} />
                Submit Record
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Sub Components --- */

interface DetailItemProps {
  label: string;
  value: string;
  full?: boolean;
  warn?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, full, warn }) => (
  <div className={`${full ? "col-span-2" : ""}`}>
    <span className="block text-[10px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5">
      {label}
    </span>
    <span
      className={cn(
        "text-sm font-medium",
        warn
          ? "text-red-600 dark:text-red-400"
          : "text-zinc-700 dark:text-zinc-200",
      )}
    >
      {value}
    </span>
  </div>
);

interface HistoryRowProps {
  label: string;
  value: string;
}

const HistoryRow: React.FC<HistoryRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0">
    <span className="text-zinc-500">{label}</span>
    <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
      {value}
    </span>
  </div>
);

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <div className="animate-in slide-in-from-bottom-2 duration-300">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-md">
        <Icon size={16} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

interface InputGroupProps {
  label: string;
  placeholder: string;
  unit: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, placeholder, unit }) => (
  <div>
    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
      {label}
    </label>
    <div className="relative group">
      <input
        type="text"
        className="input-base h-10 pl-3 pr-10 text-sm font-medium"
        placeholder={placeholder}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-zinc-400 text-xs font-medium">{unit}</span>
      </div>
    </div>
  </div>
);

export default VitalsPage;
