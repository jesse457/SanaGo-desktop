import React, { useState } from "react";
import {
  Home, UserPlus, Search, Trash2, Pencil, Mail, Phone,
  X, Clock, Shield, Send, RefreshCcw, CheckCircle2, 
  Calendar, ChevronDown, User, Activity
} from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Link } from "react-router-dom";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users] = useState([
    {
      id: 1,
      name: "Dr. Sarah Smith",
      email: "s.smith@hospital.com",
      role: "doctor",
      is_active: true,
      email_verified_at: "2023-01-01",
      phone_number: "+237 670 000 000",
    },
    {
      id: 2,
      name: "Nurse Jesse James",
      email: "j.james@hospital.com",
      role: "nurse",
      is_active: false,
      email_verified_at: null,
      phone_number: "+237 671 000 000",
    }
  ]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  return (
    <main className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-600 dark:text-zinc-300">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. HEADER (Sticky) */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm transition-all">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Breadcrumbs items={[{ label: "Home", icon: Home }, { label: "User Management" }]} />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Management</h2>
            </div>
            <Link to="/admin/users/create">
              <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
                <UserPlus size={16} strokeWidth={3} />Add New Staff
              </button>
            </Link>

          </div>

          {/* Filters Bar with Custom Styled Dropdowns */}
          <div className="px-6 py-3 bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20" 
                placeholder="Search staff by name..." 
              />
            </div>

            <CustomSelect 
                value={filterRole} 
                onChange={setFilterRole} 
                options={[
                    {label: "All Roles", value: ""},
                    {label: "Admins", value: "admin"},
                    {label: "Doctors", value: "doctor"},
                    {label: "Nurses", value: "nurse"}
                ]} 
            />

            <CustomSelect 
                value={filterStatus} 
                onChange={setFilterStatus} 
                options={[
                    {label: "All Statuses", value: ""},
                    {label: "Active", value: "active"},
                    {label: "Inactive", value: "inactive"}
                ]} 
            />

            {(search || filterRole || filterStatus) && (
              <button onClick={() => {setSearch(""); setFilterRole(""); setFilterStatus("");}} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors">
                Clear Filters
              </button>
            )}
          </div>
        </header>

        {/* 2. MAIN TABLE */}
        <div className="p-6">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-zinc-800">
              <thead className="bg-slate-50 dark:bg-zinc-950">
                <tr>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Job Role</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-zinc-800/20 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-zinc-500 shadow-inner">
                          {user.name.split(' ').map(n => n[0]).join('')}
                          {!user.email_verified_at && (
                             <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-white">!</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 dark:border-blue-900/50">
                         {user.role}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <StatusBadge active={user.is_active} verified={!!user.email_verified_at} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <button onClick={() => handleEdit(user)} className="p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm"><Pencil size={16}/></button>
                          <button className="p-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-400 hover:text-red-600 shadow-sm"><Trash2 size={16}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. COMPLETE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in" onClick={() => setEditModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-950/20">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Staff Profile Details</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium italic">Internal ID: #USR-00{selectedUser?.id}</p>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><X size={20}/></button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-8 space-y-10 max-h-[75vh] overflow-y-auto app-scrollbar">
              
              {/* Section 1: Personal Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <User size={16} strokeWidth={3} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <ModalField label="Full Name" defaultValue={selectedUser?.name} icon={User} />
                   <ModalField label="Primary Email" defaultValue={selectedUser?.email} icon={Mail} />
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Role</label>
                      <CustomSelect value={selectedUser?.role} options={[{label: "Doctor", value: "doctor"}, {label: "Nurse", value: "nurse"}]} />
                   </div>
                   <ModalField label="Phone Number" defaultValue={selectedUser?.phone_number} icon={Phone} />
                </div>

                {/* Account Status Toggle (Matches Blade Toggle) */}
                <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                   <div>
                     <p className="text-sm font-black text-slate-900 dark:text-white">Account Active</p>
                     <p className="text-xs text-slate-500 font-medium">Allow this user to sign in to the platform.</p>
                   </div>
                   <button className={`w-14 h-8 rounded-full relative transition-colors ${selectedUser?.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${selectedUser?.is_active ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
              </div>

              {/* Section 2: Shift Management (Complete logic from Blade) */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Clock size={16} strokeWidth={3} />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Shift & Roster Management</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Assign New Shift */}
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-700 dark:text-white">Assign Upcoming Shift</label>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-zinc-800 border-none rounded-xl" placeholder="Search available shifts..." />
                     </div>
                     <div className="h-40 overflow-y-auto bg-slate-50 dark:bg-zinc-800/30 rounded-2xl border border-slate-100 dark:border-zinc-800 flex items-center justify-center italic text-xs text-slate-400">
                        No upcoming shifts found...
                     </div>
                  </div>

                  {/* Right: Shift History */}
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-slate-700 dark:text-white">Recent Shift History</label>
                     <div className="space-y-2 h-52 overflow-y-auto pr-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="p-3 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl flex justify-between items-center shadow-sm">
                             <div className="flex items-center gap-3">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="text-xs font-bold">1{i} Oct, 2023</span>
                             </div>
                             <span className="text-[10px] font-mono bg-slate-100 dark:bg-zinc-700 px-2 py-1 rounded-md">08:00 - 17:00</span>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-5 bg-slate-50 dark:bg-zinc-950/50 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
               <button onClick={() => setEditModalOpen(false)} className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700">Cancel</button>
               <button className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                 <RefreshCcw size={14} /> Update User Records
               </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

/* --- REFINED UI COMPONENTS --- */

const CustomSelect = ({ value, options, onChange }) => (
  <div className="relative min-w-[140px]">
    <select 
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
    >
      {options.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
  </div>
);

const ModalField = ({ label, icon: Icon, defaultValue }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
       <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
       <input 
         defaultValue={defaultValue}
         className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-transparent rounded-2xl text-sm font-bold focus:bg-white dark:focus:bg-zinc-900 border focus:border-blue-500/30 outline-none transition-all"
       />
    </div>
  </div>
);

const StatusBadge = ({ active, verified }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${active && verified ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
    <div className={`h-1.5 w-1.5 rounded-full ${active && verified ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`} />
    {active && verified ? "Active" : "Locked"}
  </span>
);

export default UserManagement;