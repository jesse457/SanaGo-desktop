import React, { useState } from "react";
import {
  Search,
  Calendar,
  Eye,
  X,
  Check,
  User,
  ChevronRight,
  Package,
  ClipboardList,
  UserCircle,
  Hash,
  Info,
} from "lucide-react";

// Mock Data for demonstration
const MOCK_PATIENTS = [
  {
    id: 1,
    first_name: "James",
    last_name: "Wilson",
    email: "j.wilson@email.com",
    patient_uid: "PT-8821",
    age: 45,
  },
  {
    id: 2,
    first_name: "Maria",
    last_name: "Garcia",
    email: "m.garcia@email.com",
    patient_uid: "PT-9042",
    age: 29,
  },
  {
    id: 3,
    first_name: "Robert",
    last_name: "Chen",
    email: "r.chen@email.com",
    patient_uid: "PT-7712",
    age: 62,
  },
];

const MOCK_PRESCRIPTIONS = [
  {
    id: 101,
    date: "12 Jan 2026",
    time: "10:30 AM",
    doctor: "Dr. Sarah Smith",
    specialization: "Cardiologist",
    status: "new",
    items: [
      {
        id: 1,
        medication: "Amoxicillin",
        dosage: "500mg",
        frequency: "3x Daily",
        duration: "7 Days",
        prescribed: 21,
        dispensed: 0,
        stock: 45,
      },
      {
        id: 2,
        medication: "Lisinopril",
        dosage: "10mg",
        frequency: "1x Daily",
        duration: "30 Days",
        prescribed: 30,
        dispensed: 10,
        stock: 4,
      },
    ],
  },
  {
    id: 102,
    date: "08 Jan 2026",
    time: "02:15 PM",
    doctor: "Dr. Mike Ross",
    specialization: "GP",
    status: "dispensed",
    items: [],
  },
];

const DispenseMedications = () => {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activePrescription, setActivePrescription] = useState(null);

  // Status Badge Logic matching your design
  const getStatusStyle = (status) => {
    const styles = {
      new: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      dispensed:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      partial:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    };
    return styles[status] || styles.new;
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 z-30  border-b border-x-0 rounded-none border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <nav className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Home
              </span>
              <ChevronRight size={12} className="text-zinc-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                Dispense Medications
              </span>
            </nav>
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
              Pharmacy Dispensing
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Review prescriptions and safely dispense medications to patients.
            </p>
          </div>

          <div className="relative group w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 m-5">
        {/* SIDEBAR: PATIENTS LIST */}
        <aside className="lg:col-span-4 flex flex-col gap-4">
          <div className="card-base p-6 shadow-xl border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                <User size={16} /> Patients
              </h2>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black text-zinc-500">
                {MOCK_PATIENTS.length} TOTAL
              </span>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 app-scrollbar">
              {MOCK_PATIENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedPatient?.id === p.id
                      ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                      : "bg-zinc-50/50 border-transparent hover:border-zinc-200 dark:bg-zinc-900/40 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedPatient?.id === p.id
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {p.first_name[0]}
                      {p.last_name[0]}
                    </div>
                    <div className="text-left">
                      <p
                        className={`text-sm font-black ${
                          selectedPatient?.id === p.id
                            ? "text-blue-900 dark:text-blue-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        }`}
                      >
                        {p.first_name} {p.last_name}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                        {p.patient_uid}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={
                      selectedPatient?.id === p.id
                        ? "text-blue-500"
                        : "text-zinc-300"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN: PRESCRIPTION LIST */}
        <main className="lg:col-span-8">
          {selectedPatient ? (
            <div className="card-base shadow-xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col h-full">
              <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white leading-none">
                    Prescriptions for{" "}
                    <span className="text-blue-600">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </span>
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-2">
                    Patient Age: {selectedPatient.age}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Prescription Date
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Prescribed By
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Status
                      </th>
                      <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {MOCK_PRESCRIPTIONS.map((pres) => (
                      <tr
                        key={pres.id}
                        className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                      >
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-blue-500" />
                            <div>
                              <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none">
                                {pres.date}
                              </p>
                              <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1">
                                {pres.time}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                              DR
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                {pres.doctor}
                              </p>
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                                {pres.specialization}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(
                              pres.status
                            )}`}
                          >
                            {pres.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => {
                              setActivePrescription(pres);
                              setShowModal(true);
                            }}
                            className="flex items-center gap-2 ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                          >
                            <Eye size={14} strokeWidth={3} /> View Items
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card-base h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-dashed border-2 border-zinc-200 dark:border-zinc-800">
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-6">
                <UserCircle size={40} className="text-zinc-300" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
                Select a Patient
              </h3>
              <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                Please choose a patient from the left sidebar to view their
                active prescriptions.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* DISPENSING MODAL */}
      {showModal && activePrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-5xl card-base overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">
                  Dispense Items
                </h2>
                <div className="flex gap-4 mt-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] flex items-center gap-1">
                    <Hash size={12} /> Prescription #{activePrescription.id}
                  </span>
                  <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] flex items-center gap-1">
                    <User size={12} /> {selectedPatient.first_name}{" "}
                    {selectedPatient.last_name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-0 overflow-y-auto app-scrollbar">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Medication
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Regimen
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Qty (Pres/Disp)
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Dispense Now
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {activePrescription.items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/10"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                          {item.medication}
                        </p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">
                          {item.dosage}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-bold text-zinc-500">
                          {item.frequency}
                        </p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase">
                          {item.duration}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                            {item.prescribed}
                          </span>
                          <span className="text-zinc-300">/</span>
                          <span className="text-xs font-bold text-zinc-400">
                            {item.dispensed}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="number"
                          className="w-20 h-10 px-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-black outline-none focus:border-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-2 py-1 rounded-lg text-[10px] font-black border ${
                            item.stock > 10
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}
                        >
                          {item.stock} LEFT
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <textarea
                          rows="1"
                          className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium outline-none focus:border-blue-500 transition-all"
                          placeholder="Add notes..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-zinc-500">
                <Info size={16} />
                <p className="text-[10px] font-black uppercase tracking-tight">
                  Verify all quantities before saving
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-50 transition-all"
                >
                  Cancel
                </button>
                <button className="px-10 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2">
                  <Check size={16} strokeWidth={3} /> Save Dispensation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispenseMedications;
