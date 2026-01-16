import React from "react";
import {
  User,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  Key,
  Home,
  ChevronRight,
} from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";

const ProfileView = () => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="mb-8">
        <Breadcrumbs items={[{ label: "Admin" }, { label: "User Profile" }]} />
        <h1 className="heading-1">Account Settings</h1>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Quick Info Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-bold text-3xl mb-4 border border-indigo-100 dark:border-indigo-800 shadow-inner">
              JD
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Jane Doe
            </h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
              Head Nurse
            </p>

            <div className="w-full mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] text-left">
                Quick Contact
              </h3>
              <div className="space-y-3">
                <ContactRow icon={Phone} label="+237 670 000 000" />
                <ContactRow icon={Mail} label="j.doe@hospital.cm" />
                <ContactRow icon={MapPin} label="Douala, Cameroon" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Forms Area */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <Section title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <ProfileInput label="Full Name" defaultValue="Jane Doe" />
              <ProfileInput
                label="Email Address"
                defaultValue="j.doe@hospital.cm"
              />
              <ProfileInput
                label="Phone Number"
                defaultValue="+237 670 000 000"
              />
              <ProfileInput
                label="Residential Address"
                defaultValue="Bonapriso, Douala"
              />
              <div className="md:col-span-2 flex justify-end">
                <button className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white text-sm font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">
                  Update Profile
                </button>
              </div>
            </div>
          </Section>

          <Section title="Security & Password" icon={Key}>
            <div className="space-y-4 p-6">
              <ProfileInput label="Current Password" type="password" />
              <div className="grid grid-cols-2 gap-4">
                <ProfileInput label="New Password" type="password" />
                <ProfileInput label="Confirm New Password" type="password" />
              </div>
              <div className="flex justify-end pt-2">
                <button className="px-6 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-bold rounded-xl hover:bg-zinc-50 transition-all">
                  Update Password
                </button>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const ContactRow = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
    <Icon size={14} className="text-zinc-400" />
    <span className="font-medium">{label}</span>
  </div>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
    <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
      <Icon size={18} className="text-zinc-400" />
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const ProfileInput = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
      {label}
    </label>
    <input
      className="w-full h-10 px-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:bg-white dark:focus:bg-zinc-900 focus:border-indigo-500 transition-all font-medium"
      {...props}
    />
  </div>
);

export default ProfileView;
