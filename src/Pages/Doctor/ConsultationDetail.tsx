import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  CalendarDays,
  FileText,
  Beaker,
  Paperclip,
} from "lucide-react";

const ConsultationDetail = ({ consultation }) => {
  const [activeTab, setActiveTab] = useState("prescriptions");

  // Helper for Date Formatting
  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      ...(includeTime && { hour: "numeric", minute: "numeric", hour12: true }),
    }).format(date);
  };

  return (
    <main className="w-full h-full bg-gray-50 dark:bg-gray-900 font-sans text-gray-600 dark:text-gray-300 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-2">
            <li>
              <a
                href="/doctor/dashboard"
                className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 flex items-center"
              >
                <Home className="w-3 h-3 mr-1" /> Home
              </a>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li>
              <a
                href={`/doctor/patient/${consultation?.patient?.id}`}
                className="text-xs font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400"
              >
                {consultation?.patient?.first_name}{" "}
                {consultation?.patient?.last_name}
              </a>
            </li>
            <li>
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                Consultation #{consultation?.id}
              </span>
            </li>
          </ol>
        </nav>

        {/* Consultation Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-blue-600" />
                {formatDate(consultation?.created_at)}
                <span className="text-gray-400 font-normal ml-1">
                  at{" "}
                  {new Date(consultation?.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </h2>
              <p className="text-sm text-gray-500 mt-1 pl-7">
                Consultation ID: #{consultation?.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold">
                {consultation?.doctor?.name?.charAt(0) || "D"}
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  Attended By
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {consultation?.doctor?.name || "Not Available"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Diagnosis */}
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-2">
                Diagnosis
              </h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">
                  {consultation?.diagnosis_text || "No diagnosis provided"}
                </p>
              </div>
            </div>
            {/* Notes */}
            <div>
              <h3 className="font-bold text-xs uppercase text-gray-500 mb-2">
                Notes
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {consultation?.general_notes ||
                    consultation?.soap_notes ||
                    "No notes available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div>
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("prescriptions")}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "prescriptions"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <FileText
                  className={`w-5 h-5 mr-2 ${activeTab === "prescriptions" ? "text-blue-500" : "text-gray-400"}`}
                />
                Prescriptions
              </button>

              <button
                onClick={() => setActiveTab("labResults")}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "labResults"
                    ? "border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                <Beaker
                  className={`w-5 h-5 mr-2 ${activeTab === "labResults" ? "text-teal-500" : "text-gray-400"}`}
                />
                Lab Results
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            {/* Tab Content: Prescriptions */}
            {activeTab === "prescriptions" && (
              <div className="animate-in fade-in duration-300">
                {consultation?.prescriptions?.length > 0 ? (
                  consultation.prescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6"
                    >
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Prescription #{prescription.id}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(prescription.prescription_date)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                Medication
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                Dosage
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                Frequency
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">
                                Duration
                              </th>
                              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">
                                Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {prescription.items?.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                  {item.medication?.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {item.dosage}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {item.frequency}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                  {item.duration}
                                </td>
                                <td className="px-6 py-4 text-sm text-center font-bold">
                                  {item.quantity_prescribed}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500">
                      No prescriptions found
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab Content: Lab Results */}
            {activeTab === "labResults" && (
              <div className="animate-in fade-in duration-300">
                {consultation?.labResults?.length > 0 ? (
                  consultation.labResults.map((result) => (
                    <div
                      key={result.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
                    >
                      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                            Lab Result #{result.id}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatDate(result.result_date)}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {result.status}
                        </span>
                      </div>
                      <div className="p-6">
                        <div className="mb-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Results & Findings
                          </h4>
                          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                            {result.results_text}
                          </p>
                        </div>
                        {result.attachments?.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            {result.attachments.map((att) => (
                              <button
                                key={att.id}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                              >
                                <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                                {att.file_name.length > 20
                                  ? att.file_name.substring(0, 20) + "..."
                                  : att.file_name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
                    <span className="text-gray-500">No lab results found</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ConsultationDetail;
