import React, { useState, useMemo } from "react";
import { Search, Trash2, ArrowRight, Clock, Beaker } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

// --- Types ---
interface Patient {
  first_name: string;
  last_name: string;
  patient_uid: string;
}

interface TestDefinition {
  test_name: string;
  code: string;
}

interface LabRequest {
  id: number;
  patient: Patient;
  testDefinition: TestDefinition;
  request_date: string;
  status: string;
  consultation_id: number | null;
}

// --- Mock Data (Replace with API call) ---
const MOCK_REQUESTS: LabRequest[] = [
  {
    id: 1,
    patient: {
      first_name: "Sarah",
      last_name: "Connor",
      patient_uid: "PT-9920",
    },
    testDefinition: { test_name: "Complete Blood Count", code: "CBC" },
    request_date: "2023-10-24T10:30:00",
    status: "Completed",
    consultation_id: 101,
  },
  {
    id: 2,
    patient: { first_name: "John", last_name: "Doe", patient_uid: "PT-4412" },
    testDefinition: { test_name: "Lipid Profile", code: "LP" },
    request_date: "2023-10-25T14:15:00",
    status: "In_Progress",
    consultation_id: null,
  },
  {
    id: 3,
    patient: {
      first_name: "Elena",
      last_name: "Vance",
      patient_uid: "PT-1102",
    },
    testDefinition: { test_name: "Glucose Fasting", code: "GLU" },
    request_date: "2023-10-26T08:00:00",
    status: "Pending",
    consultation_id: null,
  },
];

const LabRequests = () => {
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // --- Filter Logic ---
  const filteredRequests = useMemo(() => {
    return MOCK_REQUESTS.filter((req) => {
      const matchesSearch = `${req.patient.first_name} ${req.patient.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "" || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  // --- Helper: Status Styles ---
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      case "In_Progress":
        return "bg-primary-100 text-primary-800 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      time: d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-transparent animate-in fade-in duration-500">
      {/* 1. HEADER SECTION */}
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 min-w-0">
            <Breadcrumbs
              items={[{ label: "Doctor" }, { label: "Lab Requests" }]}
            />
            <h1 className="heading-1 font-black mt-1">Lab Requests</h1>
            <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Monitor and review diagnostic tests requested for your patients.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Total
              </span>
              <span className="text-sm font-black text-zinc-900 dark:text-white">
                {filteredRequests.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative w-full md:max-w-xs group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-10"
                placeholder="Search by Patient Name..."
              />
            </div>

            <div className="relative w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base text-sm font-medium"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In_Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {(search || statusFilter) && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-black uppercase tracking-wide hover:underline transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 2. MAIN TABLE CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
        <div className="card-base overflow-hidden">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-label">Patient</th>
                    <th className="px-6 py-3 text-left text-label">
                      Test Details
                    </th>
                    <th className="px-6 py-3 text-left text-label">
                      Date Requested
                    </th>
                    <th className="px-6 py-3 text-left text-label">Status</th>
                    <th className="px-6 py-3 text-right text-label">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                      const { date, time } = formatDate(request.request_date);
                      const isCompleted = request.status === "Completed";

                      return (
                        <tr
                          key={request.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-700 dark:text-primary-300 font-black text-sm shadow-sm">
                                {request.patient.first_name.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900 dark:text-white">
                                  {request.patient.first_name}{" "}
                                  {request.patient.last_name}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                  ID: {request.patient.patient_uid}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-900 dark:text-white font-bold">
                              {request.testDefinition.test_name}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">
                              {request.testDefinition.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-zinc-900 dark:text-white font-bold">
                              {date}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium">
                              {time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${getStatusStyles(request.status)}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
                              {request.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                            {isCompleted ? (
                              <a
                                href={`/results/${request.id}`}
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 font-black flex items-center justify-end gap-1 uppercase tracking-wide"
                              >
                                View Results <ArrowRight className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="text-zinc-400 dark:text-zinc-600 cursor-not-allowed flex items-center justify-end gap-1 italic text-xs">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center bg-zinc-50 dark:bg-zinc-900/50"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-4 mb-3">
                            <Beaker className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
                          </div>
                          <h3 className="heading-1 text-base">
                            No requests found
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1 font-medium">
                            Try adjusting your search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabRequests;
