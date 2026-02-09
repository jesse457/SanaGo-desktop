import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import Dropdown from "../../components/Dropdown";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import { cn } from "../../utils/cn";

// --- Interfaces ---
interface Medication {
  id: number;
  name: string;
  description: string | null;
  stock_quantity: number;
  min_stock_level: number;
  unit_price_purchase: number;
}

interface PaginatorResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

const ManageDrugs: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(""); 
  const [page, setPage] = useState(1);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Medication | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Inventory
  const { data: inventoryData, isLoading, refetch } = useOfflineSync<PaginatorResponse<Medication>>({
    key: `pharmacist-inventory-p${page}-s${statusFilter}-q${search}`,
    fetchFn: async () => {
      const response = await apiClient.get("/pharmacist/inventory", {
        params: { 
            search: search, 
            status: statusFilter,
            page: page,
            per_page: 10
        }
      });
      return response.data.data; 
    }
  });

  const medications = inventoryData?.data || [];
  const meta = {
    currentPage: inventoryData?.current_page || 1,
    lastPage: inventoryData?.last_page || 1,
    total: inventoryData?.total || 0
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDrug) return;
    setIsProcessing(true);
    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        unit_price_purchase: parseFloat(formData.get('unit_price_purchase') as string),
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        min_stock_level: parseInt(formData.get('min_stock_level') as string),
      };
      await apiClient.put(`/pharmacist/inventory/${selectedDrug.id}`, payload);
      setShowEditModal(false);
      await refetch(); 
    } catch (error) {
      alert("Failed to update medication.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDrug) return;
    setIsProcessing(true);
    try {
      await apiClient.delete(`/pharmacist/inventory/${selectedDrug.id}`);
      setShowDeleteModal(false);
      await refetch();
    } catch (error) {
      alert("Failed to delete medication");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStockStyle = (stock: number, min: number) => {
    if (stock <= min) {
      return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <header className="flex-shrink-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumbs items={[{ label: "Pharmacy", path: "/pharmacist" }, { label: "Inventory" }]} />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase leading-none">
              Inventory Ledger
            </h1>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">
              Manage medication levels, procurement pricing, and stock security thresholds
            </p>
          </div>

          <Link to="/pharmacist/create-drugs" className="no-drag">
            <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-zinc-500/10 hover:opacity-90 transition-all active:scale-95">
              <Plus size={14} strokeWidth={3} /> Register Item
            </button>
          </Link>
        </div>

        {/* --- FILTERS BAR --- */}
        <div className="max-w-[1600px] mx-auto mt-6 flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search by drug name or description..."
              value={search}
              onChange={handleSearchChange}
              className="w-full h-11 pl-11 pr-4 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 rounded-xl text-xs font-bold outline-none transition-all"
            />
          </div>

          <Dropdown
            label={statusFilter ? (statusFilter === "low-stock" ? "Low Stock Alert" : "Stable Stock") : "All Status"}
            items={[
              { label: "All Items", onClick: () => { setStatusFilter(""); setPage(1); } },
              { label: "Low Stock Alert", onClick: () => { setStatusFilter("low-stock"); setPage(1); } },
              { label: "Stable Stock", onClick: () => { setStatusFilter("in-stock"); setPage(1); } }
            ]}
            className="h-11 w-full md:w-56"
            buttonClassName="h-11 w-full px-4 bg-zinc-100 dark:bg-zinc-800/50 border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500"
          />

          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setPage(1); }}
              className="px-4 h-11 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <main className="flex-1 p-6 md:p-8 overflow-hidden max-w-[1600px] mx-auto w-full">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto app-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                 <Loader2 className="animate-spin text-zinc-300 dark:text-zinc-600" size={40} />
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Syncing Ledger...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Medication Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Qty</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Unit Price</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Safety Limit</th>
                    <th className="px-8 py-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                  {medications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-40">
                          <PackageSearch size={40} />
                          <p className="text-xs font-bold uppercase tracking-widest">No medical records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : medications.map((drug) => (
                    <tr key={drug.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{drug.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 truncate max-w-sm mt-1 uppercase tracking-tighter">
                          {drug.description || "No supplemental details provided"}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          getStockStyle(drug.stock_quantity, drug.min_stock_level)
                        )}>
                          {drug.stock_quantity} units
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-sm text-zinc-700 dark:text-zinc-300 tracking-tighter">
                        <span className="text-[10px] text-zinc-400 mr-1 uppercase">Fcfa</span>
                        {Number(drug.unit_price_purchase).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {drug.min_stock_level} Units
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedDrug(drug); setShowEditModal(true); }}
                            className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-all"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedDrug(drug); setShowDeleteModal(true); }}
                            className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-rose-500 rounded-lg transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* --- PAGINATION --- */}
          <div className="mt-auto px-8 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Record: {meta.total} entries | Page {meta.currentPage} of {meta.lastPage}
            </span>
            <div className="flex gap-2">
              <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={meta.currentPage === 1 || isLoading}
                  className="px-3 py-1.5 text-[9px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 disabled:opacity-30 transition-all"
              >
                 Prev
              </button>
              <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={meta.currentPage === meta.lastPage || isLoading}
                  className="px-3 py-1.5 text-[9px] font-black uppercase bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 disabled:opacity-30 transition-all"
              >
                 Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* --- EDIT MODAL --- */}
      {showEditModal && selectedDrug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <form onSubmit={handleUpdate} className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Modify Entry</h2>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Item UID: {selectedDrug.id}</p>
              </div>
              <button type="button" onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={18} /></button>
            </div>

            <div className="p-8 grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Commercial Name</label>
                <input name="name" type="text" defaultValue={selectedDrug.name} required className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Purchase Unit Price</label>
                <input name="unit_price_purchase" type="number" step="0.01" defaultValue={selectedDrug.unit_price_purchase} required className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Current Quantity</label>
                <input name="stock_quantity" type="number" defaultValue={selectedDrug.stock_quantity} required className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Security Limit</label>
                <input name="min_stock_level" type="number" defaultValue={selectedDrug.min_stock_level} required className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pharmacological Notes</label>
                <textarea name="description" rows={3} defaultValue={selectedDrug.description || ""} className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>

            <div className="px-8 py-5 bg-zinc-50/50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2.5 text-[10px] font-black uppercase text-zinc-500">Discard</button>
              <button type="submit" disabled={isProcessing} className="px-8 py-2.5 bg-blue-600 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                {isProcessing && <Loader2 size={12} className="animate-spin" />}
                Commit Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {showDeleteModal && selectedDrug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">Wipe Record?</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-bold leading-relaxed">
              Confirm deletion of <span className="text-zinc-900 dark:text-zinc-200">"{selectedDrug.name}"</span>. This will purge all associated history.
            </p>
            <div className="mt-8 space-y-2">
              <button onClick={handleDelete} disabled={isProcessing} className="w-full py-3 bg-rose-600 text-white text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20">
                {isProcessing && <Loader2 size={12} className="animate-spin" />}
                Purge Record
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full py-3 text-[10px] font-black uppercase text-zinc-500">Abort Operation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDrugs;