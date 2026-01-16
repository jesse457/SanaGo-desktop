import React, { useState, ChangeEvent, InputHTMLAttributes, ElementType } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Camera,
  Check,
  LucideIcon,
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";

/**
 * 1. Define Props for InputWithIcon
 * We extend standard HTML Input attributes so we can pass things like 'placeholder'
 */
interface InputWithIconProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon | ElementType;
}

const CreateUser: React.FC = () => {
  // 2. Type the state (can be a string URL or null)
  const [preview, setPreview] = useState<string | null>(null);

  // 3. Typed event handler for file upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local URL for the image preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Clean up memory when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-bottom-2 duration-500 overflow-y-auto app-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Admin" },
                { label: "List of Staff" },
                { label: "Add New" },
              ]}
            />
            <h1 className="heading-1 font-black text-zinc-900 dark:text-white tracking-tighter">
              Add New Staff Member
            </h1>
            <p className="text-sm text-zinc-500 mt-2 font-medium">
              Fill in the form below to register a new doctor, nurse, or staff member.
            </p>
          </div>
        </div>
      </header>

      {/* Form Card */}
      <div className="card-base shadow-xl border-opacity-50 m-4">
        <form className="p-10" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-12 gap-12">
            
            {/* Left: Avatar Upload */}
            <div className="col-span-12 lg:col-span-4 flex flex-col items-center border-r border-zinc-100 dark:border-zinc-800 lg:pr-12">
              <div className="relative group cursor-pointer">
                <div className="w-40 h-40 rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 overflow-hidden flex items-center justify-center transition-all group-hover:border-primary-500 group-hover:bg-primary-500/5 shadow-inner">
                  {preview ? (
                    <img src={preview} alt="Staff Preview" className="w-full h-full object-cover" />
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
              <p className="text-[10px] text-zinc-400 mt-6 text-center leading-relaxed font-bold uppercase tracking-tighter opacity-70">
                Make sure the photo is clear.
                <br />
                Format: JPG or PNG.
              </p>
            </div>

            {/* Right: Form Fields */}
            <div className="col-span-12 lg:col-span-8 space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20">
                    <User size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                    Staff Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputWithIcon
                    label="Staff's Full Name"
                    icon={User}
                    placeholder="Example: Dr. John Doe"
                    required
                  />
                  <InputWithIcon
                    label="Active Phone Number"
                    icon={Phone}
                    placeholder="+237 ..."
                    type="tel"
                  />
                  <div className="col-span-1 md:col-span-2">
                    <InputWithIcon
                      label="Email Address (Optional)"
                      icon={Mail}
                      placeholder="name@hospital.com"
                      type="email"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <InputWithIcon
                      label="Home Address (City / Quarter)"
                      icon={MapPin}
                      placeholder="Example: Bonapriso, Douala"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <Briefcase size={16} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                    System Account Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      Assigned Department
                    </label>
                    <select className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 focus:border-primary-500 transition-all text-zinc-600 dark:text-zinc-300">
                      <option>Emergency Room (ER)</option>
                      <option>Maternity Unit</option>
                      <option>Pharmacy</option>
                      <option>Laboratory</option>
                      <option>Pediatrics</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                      User Job (System Role)
                    </label>
                    <select className="w-full h-12 px-4 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-4 ring-primary-500/10 focus:border-primary-500 transition-all text-zinc-600 dark:text-zinc-300">
                      <option>Doctor</option>
                      <option>Nurse</option>
                      <option>Pharmacist</option>
                      <option>Administrator</option>
                      <option>Lab Technician</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-5">
            <button type="button" className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all">
              Go Back
            </button>
            <button type="submit" className="button-primary px-10 py-3 shadow-xl flex items-center gap-3">
              <Check size={20} strokeWidth={3} /> Save & Add Staff
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * Sub-component for Input with Icon
 */
const InputWithIcon: React.FC<InputWithIconProps> = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-3">
    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary-500 transition-colors">
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <input
        className="w-full h-12 pl-12 pr-4 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-primary-500 focus:ring-4 ring-primary-500/10 transition-all shadow-sm"
        {...props}
      />
    </div>
  </div>
);

export default CreateUser;