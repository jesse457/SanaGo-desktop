import React, { useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  FlaskConical,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";

// --- TYPES ---
interface LabTestDefinition {
  id: number;
  test_name: string;
  description: string | null;
  price: string | number;
  units: string | null;
  created_at: string;
}

interface PaginatedResponse {
  data: LabTestDefinition[];
  total: number;
}

const ManageLabTests: React.FC = () => {
  // 1. STATE
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // 2. FETCH DATA (useOfflineSync)
  const { 
    data: testsData, 
    isLoading, 
    isSyncing, 
    refetch 
  } = useOfflineSync<PaginatedResponse>({
    key: `manage-lab-tests-${search}`,
    fetchFn: async () => {
      const response = await apiClient.get("/lab-technician/test-definitions", {
        params: { search }
      });
      return response.data.data;
    },
    autoRefresh: true,
    refreshInterval: 120000, // Refresh catalog every 2 mins
  });

  // 3. ACTIONS
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this test definition? This cannot be undone.")) return;

    setIsDeleting(id);
    try {
      await apiClient.delete(`/lab-technician/test-definitions/${id}`);
      refetch(); // Refresh list after deletion
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete test definition. It may be linked to existing requests.");
    } finally {
      setIsDeleting(null);
    }
  };

  const tests = testsData?.data || [];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 z-30 border-t-0 border-x-0 rounded-none bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[{ label: "Laboratory" }, { label: "Test Catalog" }]}
            />
            <div className="flex items-center gap-3 mt-2">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Test Definitions
                </h1>
                {isSyncing && <Loader2 size={18} className="animate-spin text-indigo-500 mt-1" />}
            </div>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Manage diagnostic test parameters, pricing, and measurement units.
            </p>
          </div>
          <Link 
            to="/laboratory/create-test"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add New Test
          </Link>
        </div>

        {/* SEARCH BAR */}
        <div className="px-6 py-3 border-t border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative group max-w-xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by test name (e.g., Glucose, CBC)..."
              className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500/30 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="flex-1 card-base shadow-xl border-opacity-50 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto app-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Test Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-center">Unit Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Measurement Units</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin text-zinc-300 mx-auto" size={32} />
                    </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-xs font-black uppercase text-zinc-400 tracking-widest">
                        No test definitions found in catalog
                    </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            <FlaskConical size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 leading-none mb-1">
                                {test.test_name}
                            </p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter truncate max-w-[200px]">
                                {test.description || "No description provided"}
                            </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        ${Number(test.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
                        {test.units || "N/A"}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                            to={`/laboratory/edit-test/${test.id}`}
                            className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-indigo-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all"
                        >
                          <Pencil size={16} strokeWidth={2.5} />
                        </Link>
                        <button 
                            onClick={() => handleDelete(test.id)}
                            disabled={isDeleting === test.id}
                            className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all disabled:opacity-50"
                        >
                          {isDeleting === test.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} strokeWidth={2.5} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageLabTests;