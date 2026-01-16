import React, { useState } from "react";
import {
  Building2,
  Map,
  Users2,
  Bed,
  Package,
  CreditCard,
  Camera,
  Save,
  Plus,
  Trash2,
  Info,
  Users,
  Server,
  Bolt,
  ShieldCheck,
  Hotel,
  LayoutGrid,
  Smartphone,
  CreditCard as CardIcon,
  ChevronRight,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // e.g., 'department', 'ward', 'bed-type'

  const tabs = [
    { id: "general", label: "Hospital Info", icon: Building2 },
    { id: "departments", label: "Units/Dept", icon: Users2 },
    { id: "wards", label: "Wards", icon: Map },
    { id: "bed-types", label: "Bed Types", icon: LayoutGrid }, // Added Bed Types
    { id: "beds", label: "Beds", icon: Bed },
    { id: "supplies", label: "Inventory", icon: Package },
    { id: "billing", label: "Subscription", icon: CreditCard },
  ];

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 relative">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs items={[{ label: "Admin" }, { label: "Settings" }]} />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tight">
              System Configuration
            </h1>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              Secure Node
            </span>
          </div>
        </div>
      </header>

      {/* TABS Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 p-1.5 bg-zinc-100 dark:bg-zinc-800/50  border border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-900 text-primary-600 shadow-md border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col overflow-hidden shadow-sm">
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "general" && <GeneralSettings />}

          {activeTab === "departments" && (
            <EntitySection
              title="Departments"
              type="Department"
              columns={["Name", "Lead", "Staff Count"]}
              data={[
                ["Cardiology", "Dr. Njoh", "12"],
                ["Pediatrics", "Dr. Bella", "8"],
              ]}
              onAdd={() => openModal("Department")}
            />
          )}

          {activeTab === "wards" && (
            <EntitySection
              title="Wards"
              type="Ward"
              columns={["Ward Name", "Block", "Capacity"]}
              data={[
                ["Ward 101", "North Wing", "20 Beds"],
                ["ICU", "West Wing", "5 Beds"],
              ]}
              onAdd={() => openModal("Ward")}
            />
          )}

          {activeTab === "bed-types" && (
            <EntitySection
              title="Bed Categories"
              type="Bed Type"
              columns={["Type Name", "Price (FCFA)", "Amenities"]}
              data={[
                ["VIP Suite", "75,000", "AC, TV, Private Bath"],
                ["Standard", "15,000", "Shared"],
              ]}
              onAdd={() => openModal("Bed Type")}
            />
          )}

          {activeTab === "beds" && (
            <EntitySection
              title="Individual Beds"
              type="Bed"
              columns={["Bed No.", "Ward", "Status"]}
              data={[
                ["B-001", "Ward 101", "Available"],
                ["B-002", "ICU", "Occupied"],
              ]}
              onAdd={() => openModal("Bed")}
            />
          )}

          {activeTab === "supplies" && (
            <EntitySection
              title="Stock Levels"
              type="Item"
              columns={["Item", "Quantity", "Min Level"]}
              data={[
                ["Gloves", "500", "100"],
                ["Alcohol", "20L", "5L"],
              ]}
              onAdd={() => openModal("Item")}
            />
          )}

          {activeTab === "billing" && <SubscriptionView />}
        </main>

        {activeTab !== "billing" && (
          <footer className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
            <button className="px-6 py-2 text-[11px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all">
              Discard
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:shadow-xl transition-all active:scale-95">
              <Save size={16} /> Save Settings
            </button>
          </footer>
        )}
      </div>

      {/* UNIFIED MODAL */}
      {isModalOpen && (
        <UnifiedModal type={modalType} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

/* --- MODAL COMPONENT --- */
const UnifiedModal = ({ type, onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white">
          Add New {type}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-8 space-y-6">
        <SettingsInput
          label={`${type} Name`}
          placeholder={`Enter ${type.toLowerCase()} label...`}
        />
        {type === "Bed Type" && (
          <SettingsInput label="Daily Rate (FCFA)" type="number" />
        )}
        {type === "Ward" && <SettingsInput label="Block/Wing Location" />}
        <div className="pt-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-all"
          >
            Cancel
          </button>
          <button className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-white bg-primary-600 rounded-2xl shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition-all">
            Create {type}
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* --- SUBSCRIPTION & PAYMENT SCREEN --- */
const SubscriptionView = () => {
  const [selectedMethod, setSelectedMethod] = useState("momo");

  const methods = [
    {
      id: "momo",
      name: "MTN MoMo",
      color: "bg-yellow-400",
      text: "text-black",
      icon: Smartphone,
    },
    {
      id: "orange",
      name: "Orange Money",
      color: "bg-orange-600",
      text: "text-white",
      icon: Smartphone,
    },
    {
      id: "card",
      name: "Credit Card",
      color: "bg-zinc-900",
      text: "text-white",
      icon: CardIcon,
    },
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      {/* Plan Summary */}
      <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl shadow-primary-500/20">
        <div>
          <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black tracking-widest uppercase">
            Premium Node
          </span>
          <h2 className="text-4xl font-black mt-4 italic tracking-tighter">
            SanaGo <span className="text-primary-200">Infinity</span>
          </h2>
          <p className="mt-2 text-primary-100 font-medium opacity-80">
            Next billing cycle: 24 Sept 2024
          </p>
        </div>
        <div className="text-center md:text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary-200">
            Total Credits
          </p>
          <p className="text-5xl font-black tracking-tighter">
            45,200{" "}
            <span className="text-sm font-bold uppercase tracking-normal">
              FCFA
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Payment Methods */}
        <div className="space-y-6">
          <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={18} className="text-primary-500" /> Recharge
            Account
          </h4>
          <div className="grid grid-cols-1 gap-3">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                  selectedMethod === m.id
                    ? "border-primary-500 bg-primary-500/5 shadow-md"
                    : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${m.color} rounded-xl flex items-center justify-center ${m.text} shadow-inner`}
                  >
                    <m.icon size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-zinc-900 dark:text-white">
                      {m.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                      Instant Processing
                    </p>
                  </div>
                </div>
                {selectedMethod === m.id && (
                  <CheckCircle2 className="text-primary-500" size={24} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Selection */}
        <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
          <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-6">
            Select Amount
          </h4>
          <div className="grid grid-cols-2 gap-4 mb-8">
            {["5,000", "10,000", "25,000", "50,000"].map((amt) => (
              <button
                key={amt}
                className="py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-black text-zinc-800 dark:text-zinc-200 hover:border-primary-500 hover:text-primary-500 transition-all"
              >
                {amt} <span className="text-[10px] opacity-50">FCFA</span>
              </button>
            ))}
          </div>
          <SettingsInput label="Or Enter Custom Amount" placeholder="0.00" />
          <button className="w-full mt-8 py-5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Initialize Payment
          </button>
        </div>
      </div>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */
const GeneralSettings = () => (
  <div className="max-w-4xl space-y-10 animate-in slide-in-from-right-2 duration-300">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      <div className="flex flex-col items-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-dashed border-zinc-300 dark:border-zinc-700 group cursor-pointer">
        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-zinc-400 group-hover:text-primary-500 transition-colors">
          <Camera size={40} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest mt-4">
          Change Logo
        </span>
      </div>
      <div className="md:col-span-2 space-y-6">
        <SettingsInput
          label="Hospital Name"
          defaultValue="St. Elizabeth General"
        />
        <SettingsInput
          label="Email Address"
          defaultValue="admin@st-elizabeth.cm"
        />
        <SettingsInput label="Full Address" defaultValue="Bonanjo, Douala" />
      </div>
    </div>
  </div>
);

const EntitySection = ({ title, type, columns, data, onAdd }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
        {title}
      </h3>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-lg hover:bg-primary-700 transition-all"
      >
        <Plus size={16} strokeWidth={3} /> Add {type}
      </button>
    </div>
    <div className="border border-zinc-100 dark:border-zinc-800 rounded-[2rem] overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest"
              >
                {col}
              </th>
            ))}
            <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {data.map((row, i) => (
            <tr
              key={i}
              className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20"
            >
              {row.map((cell, idx) => (
                <td
                  key={idx}
                  className={`px-6 py-4 text-xs ${
                    idx === 0
                      ? "font-black text-zinc-900 dark:text-white"
                      : "text-zinc-500 font-bold"
                  }`}
                >
                  {cell}
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="p-2 text-zinc-400 hover:text-primary-500 transition-colors">
                    <Info size={16} />
                  </button>
                  <button className="p-2 text-zinc-400 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SettingsInput = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
      {label}
    </label>
    <input
      className="w-full h-12 px-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
      {...props}
    />
  </div>
);

export default Settings;
