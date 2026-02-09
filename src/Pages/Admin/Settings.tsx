import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Users2,
  Map,
  Bed,
  Package,
  CreditCard,
  Camera,
  Save,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  LayoutGrid,
  Smartphone,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { apiClient } from "../../services/authService";
import Dropdown from "../../components/Dropdown";
import { toast } from "sonner";
// --- Interfaces based on your Models ---

interface Department {
  id: number;
  name: string;
  description?: string;
}
interface Ward {
  id: number;
  name: string;
  ward_number: string;
  department_id: number;
  description?: string;
  department?: Department;
}
interface BedType {
  id: number;
  name: string;
  description?: string;
  price_per_day: number;
}
interface BedModel {
  id: number;
  bed_number: string;
  ward_id: number;
  bed_type_id: number;
  is_occupied: boolean;
  ward?: Ward;
  bed_type?: BedType;
}
interface Supply {
  id: number;
  name: string;
  unit_of_measure?: string;
  current_stock: number;
  min_stock_level: number;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

interface FormOptions {
  departments: Department[];
  wards: Ward[];
  bed_types: BedType[];
}

// --- Main Component ---

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [hospitalInfo, setHospitalInfo] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Options for Select Fields (Departments, Wards, etc)
  const { data: options } = useOfflineSync<FormOptions>({
    key: "settings_options",
    fetchFn: () =>
      apiClient.get("/admin/settings/options").then((res) => res.data),
  });

  // 2. Fetch Entity List (Dynamic based on Tab)
  // Mapping tab IDs to your API route types
  const typeMap: Record<string, string> = {
    departments: "department",
    wards: "ward",
    "bed-types": "bed-type",
    beds: "bed",
    supplies: "supply",
  };
  const entityType = typeMap[activeTab];

  const {
    data: listData,
    isLoading,
    refetch,
    isSyncing,
  } = useOfflineSync<PaginatedResponse<any>>({
    key: `settings_${activeTab}_p${page}_q${search}`,
    fetchFn: () =>
      apiClient
        .get(`/admin/settings/${entityType}`, {
          params: { page, search },
        })
        .then((res) => res.data),
    autoRefresh: false,
  });

  // --- CRUD Handlers ---

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", hospitalInfo.name);
    formData.append("email", hospitalInfo.email);
    formData.append("address", hospitalInfo.address);
    if (logoFile) formData.append("logo", logoFile);

    try {
      await apiClient.post("/admin/settings/general", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("General settings saved.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenModal = (action: "create" | "edit", item?: any) => {
    setModalAction(action);
    setEditingId(item?.id || null);
    setForm(item || {});
    setIsModalOpen(true);
  };

  const handleSaveEntity = async () => {
    setIsSaving(true);
    try {
      if (modalAction === "create") {
        await apiClient.post(`/admin/settings/${entityType}`, form);
        toast.success(`${entityType} Saved Successfully`);
      } else {
        await apiClient.put(`/admin/settings/${entityType}/${editingId}`, form);
        toast.success(`${entityType} ${editingId} Edited Successfully`);
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      if (modalAction === "create") {
        toast.error(`${err}`);
        console.error(err);
      } else {
        toast.error(`${err}`);
        console.error(err);
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await apiClient.delete(`/admin/settings/${entityType}/${id}`);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs items={[{ label: "Admin" }, { label: "Settings" }]} />
            <div className="flex items-center gap-3">
              <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tight">
                Clinic Settings
              </h1>

              {(isSyncing || isLoading) && (
                <Loader2 size={16} className="animate-spin text-primary-500" />
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Adjust how the system works for your hospital and manage your
              daily equipment.
            </p>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-6 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
        {[
          { id: "general", label: "Hospital", icon: Building2 },
          { id: "departments", label: "Departments", icon: Users2 },
          { id: "wards", label: "Wards", icon: Map },
          { id: "bed-types", label: "Bed Categories", icon: LayoutGrid },
          { id: "beds", label: "Beds", icon: Bed },
          { id: "supplies", label: "Inventory", icon: Package },
          { id: "billing", label: "Subscription", icon: CreditCard },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
              setSearch("");
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap
              ${activeTab === tab.id ? "bg-white dark:bg-zinc-900 text-primary-600 shadow-md border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 hover:text-zinc-800"}`}
          >
            <tab.icon size={14} strokeWidth={2.5} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white dark:bg-zinc-950 m-4 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "general" && (
            <div className="max-w-4xl space-y-10 animate-in slide-in-from-right-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="flex flex-col items-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-[2rem] border border-dashed border-zinc-300 cursor-pointer"
                >
                  <div className="w-32 h-32 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl flex items-center justify-center text-zinc-400 overflow-hidden">
                    {logoFile ? (
                      <img
                        src={URL.createObjectURL(logoFile)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={40} />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-4">
                    Upload Logo
                  </span>
                  <input
                    type="file"
                    ref={logoInputRef}
                    hidden
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="md:col-span-2 space-y-6">
                  <SettingsInput
                    label="Hospital Name"
                    value={hospitalInfo.name}
                    onChange={(e: any) =>
                      setHospitalInfo({ ...hospitalInfo, name: e.target.value })
                    }
                  />
                  <SettingsInput
                    label="Official Email"
                    value={hospitalInfo.email}
                    onChange={(e: any) =>
                      setHospitalInfo({
                        ...hospitalInfo,
                        email: e.target.value,
                      })
                    }
                  />
                  <SettingsInput
                    label="Physical Address"
                    value={hospitalInfo.address}
                    onChange={(e: any) =>
                      setHospitalInfo({
                        ...hospitalInfo,
                        address: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {entityType && (
            <EntitySection
              title={activeTab.replace("-", " ")}
              type={activeTab}
              data={listData?.data || []}
              isLoading={isLoading}
              onAdd={() => handleOpenModal("create")}
              onEdit={(item: any) => handleOpenModal("edit", item)}
              onDelete={handleDelete}
            />
          )}

          {activeTab === "billing" && <SubscriptionView />}
        </main>

        <footer className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 flex justify-end">
          {activeTab === "general" && (
            <button
              onClick={handleSaveGeneral}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}{" "}
              Save Changes
            </button>
          )}
        </footer>
      </div>

      {isModalOpen && (
        <UnifiedModal
          type={activeTab}
          action={modalAction}
          form={form}
          options={options}
          setForm={setForm}
          isSaving={isSaving}
          onSave={handleSaveEntity}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

/* --- TABLE SECTION --- */

const EntitySection = ({
  title,
  type,
  data,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
}: any) => {
  const getHeaders = () => {
    switch (type) {
      case "departments":
        return ["Name", "Description"];
      case "wards":
        return ["Name", "Ward #", "Dept"];
      case "bed-types":
        return ["Category", "Price/Day"];
      case "beds":
        return ["Bed #", "Status"];
      case "supplies":
        return ["Item", "Unit", "Stock"];
      default:
        return ["Name"];
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
          {title}
        </h3>
        <button
          onClick={onAdd}
          className="px-6 py-2.5 bg-primary-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} /> Add New
        </button>
      </div>
      <div className="border border-zinc-100 dark:border-zinc-800 rounded-[1rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <tr>
              {getHeaders().map((h, i) => (
                <th
                  key={i}
                  className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
              <th className="px-6 py-4 text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.map((item: any) => (
              <tr
                key={item.id}
                className="group hover:bg-zinc-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-xs font-black text-zinc-900 dark:text-white">
                  {item.name || item.bed_number}
                </td>
                {type === "wards" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    {item.ward_number}
                  </td>
                )}
                {type === "wards" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    {item.department?.name || "N/A"}
                  </td>
                )}
                {type === "bed-types" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    {item.price_per_day} FCFA
                  </td>
                )}
                {type === "beds" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    <span
                      className={`px-2 py-1 rounded-md ${item.is_occupied ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                    >
                      {item.is_occupied ? "Occupied" : "Available"}
                    </span>
                  </td>
                )}
                {type === "supplies" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    {item.unit_of_measure}
                  </td>
                )}
                {type === "supplies" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500">
                    <span
                      className={
                        item.current_stock <= item.min_stock_level
                          ? "text-rose-500 font-black"
                          : ""
                      }
                    >
                      {item.current_stock}
                    </span>
                  </td>
                )}
                {type === "departments" && (
                  <td className="px-6 py-4 text-xs font-bold text-zinc-500 truncate max-w-[200px]">
                    {item.description}
                  </td>
                )}

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-zinc-400 hover:text-primary-500"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-zinc-400 hover:text-rose-500"
                    >
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
};

/* --- DYNAMIC MODAL --- */

const UnifiedModal = ({
  type,
  action,
  form,
  options,
  setForm,
  isSaving,
  onSave,
  onClose,
}: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300 mt-8">
    <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[1.5rem] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 ">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
          {action === "create" ? "Add" : "Edit"} {type.slice(0, -1)}
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-8 space-y-5">
        {/* Dynamic Fields based on Model structure */}
        {type === "beds" ? (
          <SettingsInput
            label="Bed Number"
            value={form.bed_number || ""}
            onChange={(e: any) =>
              setForm({ ...form, bed_number: e.target.value })
            }
          />
        ) : (
          <SettingsInput
            label="Name"
            value={form.name || ""}
            onChange={(e: any) => setForm({ ...form, name: e.target.value })}
          />
        )}

        {type === "wards" && (
          <>
            <SettingsInput
              label="Ward Number/Code"
              value={form.ward_number || ""}
              onChange={(e: any) =>
                setForm({ ...form, ward_number: e.target.value })
              }
            />
            <SelectInput
              label="Department"
              options={options?.departments}
              value={form.department_id}
              onChange={(val) => setForm({ ...form, department_id: val })}
            />
          </>
        )}

        {type === "bed-types" && (
          <SettingsInput
            label="Price Per Day (FCFA)"
            type="number"
            value={form.price_per_day || ""}
            onChange={(e: any) =>
              setForm({ ...form, price_per_day: e.target.value })
            }
          />
        )}

        {type === "beds" && (
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Ward"
              options={options?.wards}
              value={form.ward_id}
              onChange={(val) => setForm({ ...form, ward_id: val })}
            />
            <SelectInput
              label="Category"
              options={options?.bed_types}
              value={form.bed_type_id}
              onChange={(val) => setForm({ ...form, bed_type_id: val })}
            />
          </div>
        )}

        {type === "supplies" && (
          <div className="grid grid-cols-2 gap-4">
            <SettingsInput
              label="Unit (e.g Box)"
              value={form.unit_of_measure || ""}
              onChange={(e: any) =>
                setForm({ ...form, unit_of_measure: e.target.value })
              }
            />
            <SettingsInput
              label="Current Stock"
              type="number"
              value={form.current_stock || ""}
              onChange={(e: any) =>
                setForm({ ...form, current_stock: e.target.value })
              }
            />
          </div>
        )}

        {(type === "departments" ||
          type === "wards" ||
          type === "bed-types") && (
          <SettingsInput
            label="Description"
            value={form.description || ""}
            onChange={(e: any) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        )}

        <div className="pt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-[11px] font-black uppercase text-zinc-400 bg-zinc-100 rounded-2xl"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-4 text-[11px] font-black uppercase text-white bg-primary-600 rounded-2xl shadow-lg"
          >
            {isSaving ? (
              <>
              <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm Save"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- ATOMIC COMPONENTS ---

const SettingsInput = ({ label, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      className="w-full h-12 px-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none focus:border-primary-500"
      {...props}
    />
  </div>
);

const SelectInput = ({ label, options, value, onChange }: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <Dropdown
      label={
        value
          ? options?.find((o: any) => o.id === value)?.name || "Select Option"
          : "Select Option"
      }
      items={[
        { label: "Select Option", onClick: () => onChange("") },
        ...(options?.map((o: any) => ({
          label: o.name,
          onClick: () => onChange(o.id),
        })) || []),
      ]}
      className="w-full"
    />
  </div>
);

const SubscriptionView = () => (
  <div className="bg-zinc-900 rounded-[2.5rem] p-10 text-white flex justify-between items-center shadow-2xl">
    <div>
      <h2 className="text-3xl font-black italic tracking-tighter">
        SanaGo <span className="text-primary-500">Infinity</span>
      </h2>
      <p className="mt-2 opacity-60 text-sm">
        Automated Node Management Active
      </p>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-black uppercase text-primary-500">
        Node Credits
      </p>
      <p className="text-4xl font-black">45,200 FCFA</p>
    </div>
  </div>
);

export default Settings;
