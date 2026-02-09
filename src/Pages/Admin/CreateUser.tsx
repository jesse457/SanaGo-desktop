import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Camera,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Breadcrumbs from "../../components/Breadcrumbs";
import { apiClient } from "../../services/authService";
import InputWithIcon from "../../components/InputWithIcon";
import Dropdown from "../../components/Dropdown";

const CreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    address: "",
    role: "doctor",
    department_id: "",
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("email", formData.email);
    payload.append("phone_number", formData.phone_number);
    payload.append("address", formData.address);
    payload.append("role", formData.role);
    payload.append("department_id", formData.department_id);
    if (file) payload.append("profile_picture", file);

    try {
      await apiClient.post("/admin/users", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Staff member created and invitation sent!");
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-2 duration-500 overflow-y-auto app-scrollbar">
     
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admin" },
                { label: "Staff List" },
                { label: "Register New" },
              ]}
            />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
              Register New Staff
            </h1>
          </div>
        </div>
      </header>

      <div className="card-base shadow-xl border-opacity-50 m-4">
        <form className="p-10" onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-12">
            {/* Left: Avatar Upload */}
            <div className="col-span-12 lg:col-span-4 flex flex-col items-center border-r border-zinc-100 lg:pr-12">
              <div className="relative group cursor-pointer">
                <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center">
                  {preview ? (
                    <img
                      src={preview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <Camera className="text-zinc-400" size={40} />
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  id="avatar-up"
                  accept="image/*"
                />
                <label
                  htmlFor="avatar-up"
                  className="mt-6 block text-[11px] font-black text-primary-600 uppercase tracking-widest cursor-pointer hover:underline text-center"
                >
                  Add Staff Photo
                </label>
              </div>
            </div>

            {/* Right: Form */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-8 text-primary-500">
                  <User size={16} />
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Personal Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputWithIcon
                    label="Full Name"
                    icon={User}
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={(e: any) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <InputWithIcon
                    label="Phone Number"
                    icon={Phone}
                    placeholder="+237 ..."
                    value={formData.phone_number}
                    onChange={(e: any) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                  />
                  <div className="col-span-2">
                    <InputWithIcon
                      label="Email Address"
                      icon={Mail}
                      value={formData.email}
                      onChange={(e: any) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <InputWithIcon
                      label="Home Address"
                      icon={MapPin}
                      value={formData.address}
                      onChange={(e: any) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8 text-indigo-500">
                  <Briefcase size={16} />
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    Work Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      Assigned Department
                    </label>
                    <Dropdown
                      label={formData.department_id ? (formData.department_id === "1" ? "Emergency Room (ER)" : "Pediatrics") : "Select Dept..."}
                      items={[
                        {
                          label: "Select Dept...",
                          onClick: () => setFormData({ ...formData, department_id: "" })
                        },
                        {
                          label: "Emergency Room (ER)",
                          onClick: () => setFormData({ ...formData, department_id: "1" })
                        },
                        {
                          label: "Pediatrics",
                          onClick: () => setFormData({ ...formData, department_id: "2" })
                        }
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      System Role
                    </label>
                    <Dropdown
                      label={formData.role.charAt(0).toUpperCase() + formData.role.replace("-", " ").slice(1)}
                      items={[
                        {
                          label: "Doctor",
                          onClick: () => setFormData({ ...formData, role: "doctor" })
                        },
                        {
                          label: "Nurse",
                          onClick: () => setFormData({ ...formData, role: "nurse" })
                        },
                        {
                          label: "Receptionist",
                          onClick: () => setFormData({ ...formData, role: "receptionist" })
                        },
                        {
                          label: "Lab Technician",
                          onClick: () => setFormData({ ...formData, role: "lab-technician" })
                        },
                        {
                          label: "Administrator",
                          onClick: () => setFormData({ ...formData, role: "admin" })
                        },
                        {
                          label: "Pharmacist",
                          onClick: () => setFormData({ ...formData, role: "pharmacist" })
                        }
                      ]}
                      className="w-full"
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-zinc-100 flex justify-end gap-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-10 py-3 bg-zinc-900 dark:bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Check size={20} />
              )}{" "}
              Register Staff Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
