import React, { useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  ChevronRight,
  Home,
  X,
  AlertTriangle,
  Filter,
  RefreshCw,
  Archive,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const ManageDrugs = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // Mock Data
  const [drugs] = useState([
    {
      id: 1,
      name: "Amoxicillin",
      description: "Broad-spectrum antibiotic for bacterial infections.",
      stock: 12,
      min_stock: 20,
      unit: "Capsules",
      price: "4,500",
    },
    {
      id: 2,
      name: "Paracetamol",
      description: "Common pain reliever and fever reducer.",
      stock: 150,
      min_stock: 50,
      unit: "Tablets",
      price: "1,200",
    },
    {
      id: 3,
      name: "Lisinopril",
      description: "Used to treat high blood pressure and heart failure.",
      stock: 85,
      min_stock: 30,
      unit: "Tablets",
      price: "8,500",
    },
  ]);

  const getStockStyle = (stock, min) => {
    if (stock <= min) {
      return "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <header className="flex-shrink-0 z-30  border-b border-x-0 rounded-none border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="px-6 py-4 md:flex md:items-center md:justify-between space-y-3 md:space-y-0">
          <div>
            <nav className="flex items-center gap-2 mb-4">
              <Home size={12} className="text-zinc-400" />
              <ChevronRight size={12} className="text-zinc-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                Manage Drugs
              </span>
            </nav>
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
              Drug Inventory
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Manage medication levels, pricing, and stock alerts.
            </p>
          </div>
          <Link to="/pharmacist/create-drugs">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/25 transition-all active:scale-95">
              <Plus size={16} strokeWidth={3} /> Add New Drug
            </button>
          </Link>
        </div>

        {/* FILTERS BAR */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[240px] group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search inventory by drug name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-zinc-50 dark:bg-zinc-800/50 border border-transparent rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500/30 transition-all outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:border-blue-500 text-zinc-500"
          >
            <option value="">All Inventory</option>
            <option value="low">Low Stock</option>
            <option value="in">Healthy Stock</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
              }}
              className="px-5 h-11 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </header>

      {/* TABLE SECTION */}
      <div className="card-base shadow-xl border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col m-4">
        <div className="overflow-x-auto app-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Drug Information
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Current Stock
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Unit Price
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Min. Level
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {drugs.map((drug) => (
                <tr
                  key={drug.id}
                  className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-1">
                      {drug.name}
                    </p>
                    <p className="text-[11px] font-bold text-zinc-400 max-w-xs truncate">
                      {drug.description}
                    </p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStockStyle(
                        drug.stock,
                        drug.min_stock
                      )}`}
                    >
                      {drug.stock} {drug.unit}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      <span className="text-[10px] text-zinc-400 mr-1">
                        FCFA
                      </span>
                      {drug.price}
                    </p>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-tighter">
                      {drug.min_stock} Units
                    </p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedDrug(drug);
                          setShowEditModal(true);
                        }}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-blue-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all"
                      >
                        <Pencil size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDrug(drug);
                          setShowDeleteModal(true);
                        }}
                        className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-rose-600 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all"
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="px-8 py-5 border-t border-zinc-50 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/50 flex justify-between items-center">
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
            Inventory: {drugs.length} items listed
          </span>
          <div className="flex gap-2">
            <button className="px-5 py-2 text-[10px] font-black uppercase border border-zinc-200 dark:border-zinc-800 rounded-xl text-white bg-blue-600">
              1
            </button>
            <button className="px-5 py-2 text-[10px] font-black uppercase border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && selectedDrug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative w-full max-w-2xl card-base overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-none">
                  Edit Medication
                </h2>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-2">
                  Inventory Management
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Drug Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedDrug.name}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Dosage Unit
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedDrug.unit}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Unit Price (FCFA)
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedDrug.price}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedDrug.stock}
                    className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  defaultValue={selectedDrug.description}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500"
              >
                Cancel
              </button>
              <button className="px-10 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative w-full max-w-md card-base overflow-hidden animate-in zoom-in-95 shadow-2xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter">
                Delete Drug?
              </h2>
              <p className="text-sm font-bold text-zinc-500 mt-2">
                Are you sure you want to remove{" "}
                <span className="text-zinc-900 dark:text-white font-black">
                  "{selectedDrug.name}"
                </span>
                ? This action is permanent and cannot be reversed.
              </p>
            </div>
            <div className="px-8 py-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
              <button className="w-full py-3 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-500/25 active:scale-95 transition-all">
                Delete Permanently
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
              >
                Keep Medication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDrugs;
