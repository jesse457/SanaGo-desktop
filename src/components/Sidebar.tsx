import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Users,
  History,
  Settings2,
  UserPlus,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HeartPulse,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import SidebarItem from "./SidebarItem";
import { cn } from "../utils/cn";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const menuGroups = [
    {
      group: "Overview",
      items: [
        { label: "Hospital Home", to: "/admin/dashboard", icon: LayoutGrid },
      ],
    },
    {
      group: "Work & Money",
      items: [
        { label: "Staff Duty Roster", to: "/admin/shifts", icon: CalendarDays },
        {
          label: "Money Collected",
          to: "/admin/revenue",
          icon: Banknote,
        },
      ],
    },
    {
      group: "Staff & Records",
      items: [
        { label: "List of Staff", to: "/admin/users", icon: Users },

        { label: "System History", to: "/admin/activities", icon: History },
      ],
    },
    {
      group: "Setup",
      items: [
        { label: "Hospital Settings", to: "/admin/settings", icon: Settings2 },
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
      {/* Brand Profile Area */}
      <div className="h-16 flex items-center px-4 mb-2 shrink-0">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-colors border",
            isDark
              ? "bg-zinc-900 text-primary-400 border-zinc-800"
              : "bg-white text-primary-600 border-zinc-200",
          )}
        >
          <HeartPulse size={22} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="ml-3 flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <span
              className={cn(
                "font-bold text-sm tracking-tight",
                isDark ? "text-white" : "text-zinc-900",
              )}
            >
              SanaGo Admin
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">
              Hospital Management
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto app-scrollbar pt-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3 opacity-60">
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

      {/* User Session Area */}
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-lg shadow-primary-500/20">
            AJ
          </div>

          {!collapsed && (
            <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
              <span
                className={cn(
                  "text-[13px] font-semibold truncate block",
                  isDark ? "text-white" : "text-zinc-900",
                )}
              >
                Admin Jesse
              </span>
              <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-tight">
                Main Admin
              </p>
            </div>
          )}

          {!collapsed && (
            <Link
              to="/login"
              className="p-1.5 text-zinc-400 hover:text-rose-500 transition-colors"
            >
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-md flex items-center justify-center shadow-xl border transition-all z-50",
          isDark
            ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
            : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50",
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

export default Sidebar;
