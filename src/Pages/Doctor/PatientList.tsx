import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  RotateCw,
  Phone,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

// --- Mock Data ---
const MOCK_PATIENTS = [
  {
    id: 1,
    patient_uid: "PAT-8821",
    first_name: "Alexander",
    last_name: "Zverev",
    age: 27,
    phone: "+49 171 2345678",
    profile_picture: null,
    is_active: true,
    appointments: [
      { id: 101, date: "2024-06-20T10:00:00" },
      { id: 100, date: "2024-01-15T14:30:00" },
    ],
  },
  {
    id: 2,
    patient_uid: "PAT-4432",
    first_name: "Elena",
    last_name: "Rybakina",
    age: 24,
    phone: "+7 701 9876543",
    profile_picture: "https://i.pravatar.cc/150?u=elena",
    is_active: false,
    appointments: [{ id: 102, date: "2023-11-10T09:00:00" }],
  },
];

const PatientList = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name_asc");
  const [filterStatus, setFilterStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const filteredPatients = useMemo(() => {
    let result = [...MOCK_PATIENTS];

    if (search) {
      result = result.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          p.patient_uid.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filterStatus) {
      if (filterStatus === "active") result = result.filter((p) => p.is_active);
      if (filterStatus === "new") result = result.filter((p) => p.id > 1);
    }

    return result;
  }, [search, filterStatus, sortBy]);

  const getVisits = (appointments) => {
    const now = new Date();
    const future = appointments
      .map((a) => new Date(a.date))
      .filter((d) => d > now)
      .sort((a, b) => a - b)[0];

    const past = appointments
      .map((a) => new Date(a.date))
      .filter((d) => d <= now)
      .sort((a, b) => b - a)[0];

    return {
      next: future
        ? future.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      last: past
        ? past.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Never",
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-transparent animate-in fade-in duration-500">
      <header className="flex-shrink-0 z-30  border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <Breadcrumbs items={[{ label: "Doctor" }, { label: "Patients" }]} />
            <h1 className="heading-1 font-black mt-1">My Patients</h1>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mt-1">
              View and manage your assigned patients and their clinical history.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-primary-500/10 text-primary-600 border border-primary-500/20">
              <Users className="w-3 h-3 mr-2" />
              {filteredPatients.length} Active
            </span>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-lg group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name or UID..."
              className="input-base pl-10"
              onChange={(e) => setSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <RotateCw className="h-4 w-4 text-primary-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <select
              className="input-base w-auto text-sm font-medium"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="recent">Recently Added</option>
            </select>

            <select
              className="input-base w-auto text-sm font-medium"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="new">New Patients</option>
            </select>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 app-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => {
            const { next, last } = getVisits(patient.appointments);

            return (
              <div
                key={patient.id}
                className="card-base p-0 hover:border-primary-500/30 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col"
              >
                <div className="p-5 flex-1">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                      {patient.profile_picture ? (
                        <img
                          src={patient.profile_picture}
                          className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm"
                          alt=""
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/20">
                          {patient.first_name.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 block h-4 w-4 rounded-full border-2 border-white dark:border-zinc-900 ${patient.is_active ? "bg-emerald-500" : "bg-zinc-400"}`}
                      ></span>
                    </div>

                    <div className="min-w-0 flex-1 pt-1">
                      <h3 className="heading-1 text-lg truncate group-hover:text-primary-500 transition-colors">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                          {patient.patient_uid}
                        </span>
                        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                          {patient.age} yrs old
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary-500/5 group-hover:border-primary-500/10 transition-colors">
                      <span className="text-label block mb-1">Next Visit</span>
                      <span
                        className={`block text-xs font-black truncate ${next ? "text-primary-600" : "text-zinc-400 italic"}`}
                      >
                        {next || "None"}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 group-hover:bg-primary-500/5 group-hover:border-primary-500/10 transition-colors">
                      <span className="text-label block mb-1">Last Visit</span>
                      <span className="block text-xs font-black text-zinc-700 dark:text-zinc-300 truncate">
                        {last}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center text-xs font-semibold text-zinc-500">
                    <Phone className="w-3.5 h-3.5 mr-2 opacity-60" />
                    {patient.phone || "No Phone"}
                  </div>
                  <button className="flex items-center text-primary-600 dark:text-primary-400 text-xs font-black uppercase tracking-wide group-hover:translate-x-1 transition-transform">
                    View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredPatients.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-full p-4 mb-4">
                <UserPlus className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="heading-1 text-lg">No patients found</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
                Try adjusting your search filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;
