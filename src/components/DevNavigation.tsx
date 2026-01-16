import { Link, useLocation } from "react-router-dom";
import { Shield, Stethoscope, LogIn, Contact2, Pill, FlaskConical } from "lucide-react";
import React from "react";
export default function DevNavigation() {
  const location = useLocation();
  if (process.env.NODE_ENV !== "development") return null;

  const navItems = [
    { to: "/login", label: "Auth", icon: LogIn, color: "hover:text-white" },
    { to: "/admin/dashboard", label: "Admin", icon: Shield, color: "hover:text-zinc-400" },
    { to: "/reception/dashboard", label: "Reception", icon: Contact2, color: "hover:text-rose-400" },
    { to: "/pharmacist/dashboard", label: "Pharmacy", icon: Pill, color: "hover:text-emerald-400" },
    { to: "/laboratory/dashboard", label: "Lab", icon: FlaskConical, color: "hover:text-indigo-400" },
    { to: "/doctor/appointments", label: "Doctor", icon: Stethoscope, color: "hover:text-purple-400" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:opacity-100 opacity-60 transition-all">
      <span className="text-zinc-500 hidden sm:block">Nodes:</span>
      {navItems.map((item, idx) => (
        <React.Fragment key={item.to}>
          <Link
            to={item.to}
            className={`flex items-center gap-1.5 transition-colors ${location.pathname.includes(item.to.split('/')[1]) ? "text-white" : "text-zinc-500"} ${item.color}`}
          >
            <item.icon size={14} /> {item.label}
          </Link>
          {idx !== navItems.length - 1 && <div className="w-px h-4 bg-white/10"></div>}
        </React.Fragment>
      ))}
    </div>
  );
}