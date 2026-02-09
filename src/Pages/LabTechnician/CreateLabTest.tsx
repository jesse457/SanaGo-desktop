import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Beaker,
  Scale,
  PencilLine,
  Check,
  X,
  PlusCircle,
  Loader2,
  ClipboardList,
  ArrowLeft
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";

interface TestFormData {
  test_name: string;
  price: string;
  units: string;
  description: string;
}

interface StatusState {
  type: "success" | "error";
  message: string;
}

const CreateLabTest: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<TestFormData>({
    test_name: "",
    price: "",
    units: "",
    description: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Dynamic clear of errors
    if (validationErrors[name]) {
        setValidationErrors(prev => {
            const fresh = { ...prev };
            delete fresh[name];
            return fresh;
        });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setValidationErrors({});

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
      };

      const response = await apiClient.post("/lab-technician/test-definitions", payload);

      if (response.data.success) {
        setStatus({ type: "success", message: "Lab test created and published successfully!" });
        setFormData({ test_name: "", price: "", units: "", description: "" });
        // Optional: navigate("/laboratory/catalog") after a delay
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setValidationErrors(error.response.data.errors || {});
        setStatus({ type: "error", message: "Validation Error: Please check the fields." });
      } else {
        setStatus({
          type: "error",
          message: error.response?.data?.message || "Internal server error. Please try later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-zinc-50/30 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-8 py-6 mb-8">
        <div className="max-w-4xl mx-auto w-full">
          <Breadcrumbs items={[{ label: "Laboratory" }, { label: "Catalog" }, { label: "New Test" }]} />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">
                New Test Definition
              </h1>
              <p className="text-sm text-zinc-500 mt-1 font-medium italic">
                Define measurement units and diagnostic pricing.
              </p>
            </div>
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto w-full px-8 pb-20">
        {status && (
          <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between animate-in slide-in-from-top-4 ${
            status.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <div className="flex items-center gap-3">
              {status.type === 'success' ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
              <span className="text-xs font-black uppercase tracking-widest">{status.message}</span>
            </div>
            <button onClick={() => setStatus(null)} className="opacity-50 hover:opacity-100 transition-opacity">
              <X size={18} />
            </button>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10 lg:p-14">
            <div className="space-y-12">
              <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <ClipboardList size={24} />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">Technical Configuration</h3>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">Test Identification & Pricing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Test Name */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Test Name <span className="text-rose-500">*</span></label>
                    {validationErrors.test_name && <span className="text-[9px] font-bold text-rose-500 uppercase">{validationErrors.test_name[0]}</span>}
                  </div>
                  <div className="relative group">
                    <Beaker className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${validationErrors.test_name ? 'text-rose-500' : 'text-zinc-300 group-focus-within:text-indigo-500'}`} size={20} />
                    <input 
                      type="text" 
                      name="test_name"
                      value={formData.test_name}
                      onChange={handleChange}
                      placeholder="e.g., Complete Blood Count (CBC)" 
                      className={`w-full h-14 pl-14 pr-6 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl text-sm font-bold transition-all outline-none ${
                        validationErrors.test_name ? 'border-rose-500 ring-4 ring-rose-500/5' : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900'
                      }`} 
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-3">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Price (USD)</label>
                    {validationErrors.price && <span className="text-[9px] font-bold text-rose-500 uppercase">Required</span>}
                  </div>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-black text-sm">$</div>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01" 
                      placeholder="0.00" 
                      className={`w-full h-14 pl-12 pr-6 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl text-sm font-bold transition-all outline-none ${
                        validationErrors.price ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500'
                      }`} 
                    />
                  </div>
                </div>

                {/* Units */}
                <div className="space-y-3">
                  <div className="flex justify-between px-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Unit of Measure</label>
                    {validationErrors.units && <span className="text-[9px] font-bold text-rose-500 uppercase">Invalid</span>}
                  </div>
                  <div className="relative group">
                    <Scale className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="text" 
                      name="units"
                      value={formData.units}
                      onChange={handleChange}
                      placeholder="e.g., mg/dL, mmol/L" 
                      className={`w-full h-14 pl-14 pr-6 bg-zinc-50 dark:bg-zinc-950 border rounded-2xl text-sm font-bold transition-all outline-none ${
                        validationErrors.units ? 'border-rose-500' : 'border-zinc-200 dark:border-zinc-800 focus:border-indigo-500'
                      }`} 
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Clinical Description</label>
                  <div className="relative group">
                    <PencilLine className="absolute left-5 top-5 text-zinc-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <textarea 
                      rows={4} 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Briefly describe the test methodology..." 
                      className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 transition-all outline-none resize-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-end gap-6">
              <button 
                type="button" 
                onClick={() => setFormData({ test_name: "", price: "", units: "", description: "" })}
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-rose-500 transition-all"
              >
                Reset Fields
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="flex items-center justify-center gap-3 px-12 py-4 bg-zinc-900 dark:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <PlusCircle size={18} />}
                {loading ? "Processing..." : "Register Lab Test"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLabTest;