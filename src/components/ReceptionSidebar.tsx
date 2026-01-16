import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  LayoutGrid,
  CalendarDays,
  Users,
  UserPlus,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Contact2,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import { useAuth } from "../providers/AuthProvider"; // 1. Import Auth Hook
import SidebarItem from "./SidebarItem";
import { cn } from "../utils/cn";

interface ReceptionSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ReceptionSidebar: React.FC<ReceptionSidebarProps> = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme();
  const { user, logout } = useAuth(); // 2. Get user data and logout function
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const menuGroups = [
    {
      group: "Main Menu",
      items: [
        { label: "Dashboard", to: "/reception/dashboard", icon: LayoutGrid },
        { label: "Appointments", to: "/reception/appointments", icon: CalendarDays },
        { label: "Patients", to: "/reception/patients", icon: Users },
      ],
    },
    {
      group: "Operations",
      items: [
        { label: "Check-in / Admit", to: "/reception/admissions", icon: UserPlus },
        { label: "Feedbacks", to: "/reception/feedback", icon: MessageSquareText },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 ease-in-out z-40 border-r",
        isDark
          ? "bg-zinc-950 border-zinc-900 text-zinc-400"
          : "bg-zinc-50 border-zinc-200 text-zinc-600",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Front Desk Brand Area */}
      <div className="h-16 flex items-center px-4 mb-2 shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg transition-all border",
            "bg-gradient-to-tr from-rose-500 to-pink-500 text-white border-transparent shadow-rose-500/20"
          )}
        >
          <Contact2 size={22} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="ml-3 flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <span
              className={cn(
                "font-black text-sm tracking-tight uppercase",
                isDark ? "text-white" : "text-zinc-900",
              )}
            >
              Front Desk
            </span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">
              Reception Node
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto app-scrollbar pt-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 opacity-60">
                {group.group}
              </p>
            )}
            {group.items.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                collapsed={collapsed}
                isDark={isDark}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Receptionist Session Area */}
      <div className="p-4 mt-auto">
        <div
          className={cn(
            "flex items-center gap-3 p-2.5 rounded-2xl transition-all border",
            isDark
              ? "bg-zinc-900/50 border-zinc-800/50"
              : "bg-white border-zinc-200 shadow-sm",
            collapsed ? "justify-center" : "",
          )}
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xs font-black border border-rose-200 dark:border-rose-500/20">
              {/* Dynamic Initials */}
              {user?.name ? getInitials(user.name) : "U"}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full"></div>
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
              <span
                className={cn(
                  "text-xs font-black truncate block tracking-tight uppercase",
                  isDark ? "text-white" : "text-zinc-900",
                )}
              >
                {/* Dynamic Name */}
                {user?.name || "User"}
              </span>
              <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-widest">
                {/* Dynamic Role */}
                {user?.role || "Receptionist"}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout} // 3. Attach Logout Handler
              className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-md flex items-center justify-center shadow-xl border transition-all z-50",
          isDark
            ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900",
        )}
      >
        {collapsed ? (
          <ChevronRight size={12} strokeWidth={3} />
        ) : (
          <ChevronLeft size={12} strokeWidth={3} />
        )}
      </button>
    </aside>
  );
};

export default ReceptionSidebar;