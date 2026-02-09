import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  Calendar,
  X,
  Layers,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync"; // Adjust path as needed
import { apiClient } from "../../services/authService"; // Adjust path as needed
import Dropdown from "../../components/Dropdown";

// --- Interfaces ---

interface ActivityUser {
  id: number;
  name: string;
  email: string;
  initials: string;
  profile_picture?: string;
}

interface Activity {
  id: number;
  user: ActivityUser;
  type: "login" | "created" | "updated" | "deleted" | string;
  description: string;
  time: string;
  ip: string;
}

interface PaginatedResponse {
  data: Activity[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

// --- Main Component ---

const UserActivities: React.FC = () => {
  // 1. Filter & Pagination State
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );

  /**
   * 2. Data Fetching via useOfflineSync
   * The key is dynamic so that different filter/page combinations are cached separately.
   */
  const syncKey = `activities_q:${search}_t:${typeFilter}_d:${dateFilter}_p:${page}`;

  const fetchActivities = async (): Promise<PaginatedResponse> => {
    const response = await apiClient.get<PaginatedResponse>(
      "/admin/user-activities",
      {
        params: {
          q: search,
          type: typeFilter,
          date: dateFilter,
          page: page,
        },
      },
    );
    return response.data;
  };

  const { data, isLoading, isSyncing, refetch } =
    useOfflineSync<PaginatedResponse>({
      key: syncKey,
      fetchFn: fetchActivities,
      autoRefresh: true,
      refreshInterval: 60000, // 1 minute
    });

  // 3. UI Helpers
  const getTypeStyle = (type: string) => {
    const styles: Record<string, string> = {
      login:
        "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
      created:
        "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      updated:
        "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
      deleted:
        "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    };
    return (
      styles[type] ||
      "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
    );
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setDateFilter("");
    setPage(1);
  };

  // Extract variables for easier rendering
  const activities = data?.data || [];
  const totalItems = data?.total || 0;
  const lastPage = data?.last_page || 1;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[{ label: "Admin" }, { label: "System History" }]}
            />
            <div className="flex items-center gap-3">
              <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
                System History
              </h1>
              {isSyncing && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-500/20">
                  <Loader2 className="animate-spin" size={10} /> Syncing
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Keep track of staff activities and system modifications.
            </p>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
            <Layers size={16} /> Save as CSV
          </button>
        </div>

        {/* FILTERS BAR */}
        <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative flex-1 min-w-[240px] group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by staff name or action..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 px-3 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Calendar className="text-zinc-400" size={14} />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-xs font-black uppercase tracking-tight outline-none dark:text-white"
            />
          </div>

          <Dropdown
            label={
              typeFilter
                ? typeFilter === "login"
                  ? "Logged In"
                  : typeFilter === "created"
                    ? "Added New"
                    : typeFilter === "updated"
                      ? "Changed/Edited"
                      : "Removed/Deleted"
                : "All Actions"
            }
            items={[
              {
                label: "All Actions",
                onClick: () => {
                  setTypeFilter("");
                  setPage(1);
                },
              },
              {
                label: "Logged In",
                onClick: () => {
                  setTypeFilter("login");
                  setPage(1);
                },
              },
              {
                label: "Added New",
                onClick: () => {
                  setTypeFilter("created");
                  setPage(1);
                },
              },
              {
                label: "Changed/Edited",
                onClick: () => {
                  setTypeFilter("updated");
                  setPage(1);
                },
              },
              {
                label: "Removed/Deleted",
                onClick: () => {
                  setTypeFilter("deleted");
                  setPage(1);
                },
              },
            ]}
            className="h-10"
          />

          {(search || typeFilter || dateFilter) && (
            <button
              onClick={clearFilters}
              className="px-5 h-10 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="flex-1 m-4 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col mb-4">
        <div className="overflow-x-auto app-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Staff Member
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Action Taken
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Short Description
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  When?
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-20 text-center text-zinc-400 font-black uppercase tracking-widest text-xs"
                  >
                    No activities found.
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-700 shadow-sm">
                          {activity.user.initials}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                            {activity.user.name}
                          </p>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            IP: {activity.ip}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(activity.type)}`}
                      >
                        {activity.type.toUpperCase().replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-[13px] font-bold text-zinc-500 max-w-xs truncate lg:max-w-md">
                        {activity.description}
                      </p>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                          {activity.time.split(",")[0]}
                        </span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          {activity.time.split(",")[1]}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-primary-600 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-8 py-5 border-t border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50 flex justify-between items-center shrink-0">
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight">
            Showing {data?.from || 0} - {data?.to || 0} of {totalItems} items
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              <ChevronLeft size={14} className="inline mr-1" /> Prev
            </button>
            <div className="flex items-center px-4 text-xs font-black text-primary-600">
              {page} / {lastPage}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              disabled={page === lastPage}
              className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              Next <ChevronRight size={14} className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVITY DETAIL MODAL */}
      {selectedActivity && (
        <DetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          getTypeStyle={getTypeStyle}
        />
      )}
    </div>
  );
};

/* --- SUB-COMPONENT: DETAIL MODAL --- */

interface DetailModalProps {
  activity: Activity;
  onClose: () => void;
  getTypeStyle: (type: string) => string;
}

const DetailModal: React.FC<DetailModalProps> = ({
  activity,
  onClose,
  getTypeStyle,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    />
    <div className="relative w-full max-w-lg card-base overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl bg-white dark:bg-zinc-900">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white">
            Action Details
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">
            Full breakdown of the event
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-400"
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-8 space-y-8">
        <div className="flex items-center gap-5 p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-inner">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-zinc-400 text-lg shadow-sm">
            {activity.user.initials}
          </div>
          <div>
            <p className="text-base font-black text-zinc-900 dark:text-white leading-none mb-1">
              {activity.user.name}
            </p>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-tight">
              {activity.user.email}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Action Type
              </p>
              <span
                className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest ${getTypeStyle(activity.type)}`}
              >
                {activity.type.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                Computer ID
              </p>
              <p className="text-xs font-black text-zinc-700 dark:text-zinc-300 tracking-widest">
                {activity.ip}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Time & Date
            </p>
            <div className="flex items-center gap-3 text-xs font-black text-zinc-600 dark:text-zinc-400">
              <Calendar
                size={18}
                className="text-primary-500"
                strokeWidth={2.5}
              />{" "}
              {activity.time}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
              Action Notes
            </p>
            <div className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 text-sm font-bold text-white leading-relaxed shadow-2xl italic">
              "{activity.description}"
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-10 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-all"
        >
          Close Window
        </button>
      </div>
    </div>
  </div>
);

export default UserActivities;
