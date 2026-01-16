import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  UserPlus,
  TriangleAlert,
  BadgeCheck,
  Trash2,
  X,
  CloudUpload,
  File,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const PatientConsultation = () => {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState("clinical");
  const [patientQuery, setPatientQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  // --- Form State ---
  const [clinicalData, setClinicalData] = useState({
    complaint: "",
    clinicalNotes: "",
    diagnosisText: "",
  });
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [labItems, setLabItems] = useState([]);
  const [attachments, setAttachments] = useState([]);

  // --- Mock Data (Replace with API calls) ---
  const mockPatientResults = [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      patient_uid: "PAT-001",
      age: 45,
      gender: "male",
      phone: "+123456789",
      allergies: "Peanuts",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      patient_uid: "PAT-002",
      age: 32,
      gender: "female",
      phone: "+987654321",
      allergies: null,
    },
  ];

  const allMedications = [
    { id: 1, name: "Amoxicillin", stock: 50 },
    { id: 2, name: "Paracetamol", stock: 200 },
  ];

  const allLabTests = [
    { id: 1, test_name: "Complete Blood Count", code: "CBC" },
    { id: 2, test_name: "Lipid Profile", code: "LIP" },
  ];

  // --- Logic Handlers ---
  const handleAddMedication = (medId) => {
    const med = allMedications.find((m) => m.id === parseInt(medId));
    if (med) {
      setPrescriptionItems([
        ...prescriptionItems,
        { ...med, dosage: "", frequency: "", duration: "" },
      ]);
    }
  };

  const handleAddLab = (labId) => {
    const lab = allLabTests.find((l) => l.id === parseInt(labId));
    if (lab) {
      setLabItems([...labItems, { ...lab, urgency: "normal", reason: "" }]);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  return (
    <div className="w-full h-full bg-zinc-50 dark:bg-transparent overflow-hidden flex flex-col animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4">
          <Breadcrumbs
            items={[{ label: "Doctor" }, { label: "Consultation" }]}
          />
          <h1 className="heading-1 font-black mt-1">Patient Consultation</h1>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR (SEARCH) */}
        <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10 h-full">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 relative z-20">
            <label className="text-label mb-2 block">Find Patient</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                className="input-base pl-10"
                placeholder="Name or ID..."
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
              />

              {/* Dropdown Results Simulation */}
              {patientQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 card-base overflow-hidden z-50 shadow-xl">
                  {mockPatientResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => {
                        setSelectedPatient(res);
                        setPatientQuery("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex items-center gap-3 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary-500/20">
                        {res.first_name[0]}
                        {res.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-zinc-900 dark:text-white text-sm truncate">
                          {res.first_name} {res.last_name}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium">
                          {res.patient_uid}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedPatient ? (
            <div className="flex-1 overflow-y-auto p-5 app-scrollbar">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black mb-3 shadow-lg shadow-primary-500/20 border border-zinc-200 dark:border-zinc-700">
                  {selectedPatient.first_name[0]}
                </div>
                <h2 className="heading-1 text-xl">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 mt-2 border border-zinc-200 dark:border-zinc-700">
                  {selectedPatient.age} Years • {selectedPatient.gender}
                </span>
              </div>
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <span className="text-label">Contact</span>
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                    {selectedPatient.phone}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-100 dark:border-red-800/30">
                  <span className="text-label text-red-600 dark:text-red-400 flex items-center gap-1">
                    <TriangleAlert className="w-3 h-3" /> Allergies
                  </span>
                  <p className="text-sm font-bold text-red-800 dark:text-red-300 mt-1">
                    {selectedPatient.allergies || "No known allergies"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
              <User className="w-16 h-16 mb-3 opacity-50" />
              <p className="text-sm font-medium">Select a patient to begin</p>
            </div>
          )}
        </aside>

        {/* RIGHT MAIN */}
        <main className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-transparent min-w-0 relative">
          {selectedPatient ? (
            <>
              {/* Tabs Header */}
              <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 pt-4 flex items-center justify-between flex-shrink-0 z-10">
                <div className="flex space-x-6 overflow-x-auto no-scrollbar">
                  {[
                    { id: "clinical", label: "Clinical Notes" },
                    { id: "rx", label: "Prescriptions" },
                    { id: "labs", label: "Labs & Tests" },
                    { id: "files", label: "Attachments" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 outline-none ${
                        activeTab === tab.id
                          ? "border-primary-500 text-primary-600 dark:text-primary-400"
                          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "files" && attachments.length > 0 && (
                        <span className="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 text-[10px] px-2 py-0.5 rounded-full font-black">
                          {attachments.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pb-2 pl-4">
                  <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all">
                    Draft
                  </button>
                  <button className="button-primary flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" /> Sign
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
                {/* 1. Clinical Tab */}
                {activeTab === "clinical" && (
                  <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
                    <div className="card-base p-6">
                      <label className="block text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">
                        Chief Complaint <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows="3"
                        className="input-base"
                        placeholder="Reason for visit..."
                        value={clinicalData.complaint}
                        onChange={(e) =>
                          setClinicalData({
                            ...clinicalData,
                            complaint: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="card-base p-6">
                      <label className="block text-sm font-black text-zinc-700 dark:text-zinc-200 mb-2">
                        Clinical Notes & Exam
                      </label>
                      <textarea
                        rows="6"
                        className="input-base"
                        placeholder="Detailed notes..."
                        value={clinicalData.clinicalNotes}
                        onChange={(e) =>
                          setClinicalData({
                            ...clinicalData,
                            clinicalNotes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* 2. Rx Tab */}
                {activeTab === "rx" && (
                  <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
                    <div className="card-base p-6">
                      <div className="mb-6">
                        <select
                          className="input-base"
                          onChange={(e) =>
                            e.target.value &&
                            handleAddMedication(e.target.value)
                          }
                        >
                          <option value="">Select Medication...</option>
                          {allMedications.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {prescriptionItems.length > 0 ? (
                        <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead className="bg-zinc-50 dark:bg-zinc-800">
                              <tr>
                                <th className="px-4 py-3 text-left text-label">
                                  Drug
                                </th>
                                <th className="px-4 py-3 text-left text-label">
                                  Dosage
                                </th>
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                              {prescriptionItems.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="px-4 py-3 text-sm dark:text-white font-bold">
                                    {item.name}
                                  </td>
                                  <td className="px-4 py-3">
                                    <input
                                      type="text"
                                      className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 bg-white dark:bg-zinc-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none"
                                      placeholder="e.g. 500mg"
                                    />
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <button
                                      onClick={() =>
                                        setPrescriptionItems(
                                          prescriptionItems.filter(
                                            (_, i) => i !== idx,
                                          ),
                                        )
                                      }
                                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                          <p className="text-zinc-500 font-medium">
                            No medications added.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Labs Tab */}
                {activeTab === "labs" && (
                  <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
                    <div className="card-base p-6">
                      <select
                        className="input-base mb-6"
                        onChange={(e) =>
                          e.target.value && handleAddLab(e.target.value)
                        }
                      >
                        <option value="">Add Lab Test...</option>
                        {allLabTests.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.test_name}
                          </option>
                        ))}
                      </select>

                      <div className="space-y-3">
                        {labItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center hover:border-primary-500/30 transition-colors"
                          >
                            <div>
                              <div className="font-black text-zinc-900 dark:text-white">
                                {item.test_name}
                              </div>
                              <div className="text-xs text-zinc-500 font-medium mt-0.5">
                                {item.code}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                setLabItems(
                                  labItems.filter((_, i) => i !== idx),
                                )
                              }
                              className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Files Tab */}
                {activeTab === "files" && (
                  <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
                    <div className="card-base p-6">
                      <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors relative">
                        <input
                          type="file"
                          multiple
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={handleFileUpload}
                        />
                        <CloudUpload className="w-12 h-12 text-primary-500 mx-auto mb-3" />
                        <h3 className="text-zinc-900 dark:text-white font-black">
                          Click or Drag files here
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1 font-medium">
                          PDF, PNG, JPG up to 10MB
                        </p>
                      </div>

                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="relative group bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 hover:border-primary-500/30 transition-all"
                          >
                            <div className="h-24 w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2 text-zinc-400">
                              <File className="w-10 h-10" />
                            </div>
                            <p className="text-xs truncate font-medium text-zinc-700 dark:text-zinc-300">
                              {file.name}
                            </p>
                            <button
                              onClick={() =>
                                setAttachments(
                                  attachments.filter((_, i) => i !== idx),
                                )
                              }
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center text-zinc-400 p-6">
                <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-200 dark:border-zinc-700">
                  <UserPlus className="w-10 h-10 text-zinc-300" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  Ready for Consultation
                </h3>
                <p className="max-w-xs text-center mt-2 text-sm text-zinc-500 font-medium">
                  Search for a patient on the left to begin.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientConsultation;
