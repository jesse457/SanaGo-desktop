import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid, FlaskConical, History, Settings2,
  ChevronLeft, ChevronRight, LogOut, Beaker
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";
import SidebarItem from "./SidebarItem";
import { cn } from "../utils/cn";

interface LabSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const LabSidebar: React.FC<LabSidebarProps> = ({ collapsed, setCollapsed }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();

  const menuGroups = [
    {
      group: "Operations",
      items: [
        { label: "Dashboard", to: "/laboratory/dashboard", icon: LayoutGrid },
        { label: "Test Requests", to: "/laboratory/requests", icon: FlaskConical },
      ],
    },
    {
      group: "Archives",
      items: [
        { label: "Test Results", to: "/laboratory/history", icon: History },
      ],
    },
    {
      group: "System",
      items: [
        { label: "Manage Tests", to: "/laboratory/manage-tests", icon: Settings2 },
      ],
    },
  ];

  return (
    <aside className={cn(
      "relative flex flex-col h-full transition-all duration-300 ease-in-out z-40 border-r",
      isDark ? "bg-zinc-950 border-zinc-900 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600",
      collapsed ? "w-[72px]" : "w-64",
    )}>
      <div className="h-16 flex items-center px-4 mb-2 shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border bg-gradient-to-tr from-indigo-500 to-violet-600 text-white border-transparent shadow-indigo-500/20"
        )}>
          <Beaker size={22} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="ml-3 flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
            <span className={cn("font-black text-sm tracking-tight uppercase", isDark ? "text-white" : "text-zinc-900")}>Laboratory</span>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] leading-none">Diagnostic Node</span>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-6 overflow-y-auto app-scrollbar pt-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && <p className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 opacity-60">{group.group}</p>}
            {group.items.map((item) => (
              <SidebarItem key={item.to} {...item} collapsed={collapsed} isDark={isDark}  />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className={cn("flex items-center gap-3 p-2.5 rounded-2xl transition-all border", isDark ? "bg-zinc-900/50 border-zinc-800/50" : "bg-white border-zinc-200 shadow-sm", collapsed ? "justify-center" : "")}>
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black border border-indigo-200 dark:border-indigo-500/20">LT</div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden animate-in fade-in duration-300">
              <span className={cn("text-xs font-black truncate block tracking-tight uppercase", isDark ? "text-white" : "text-zinc-900")}>Lab Tech</span>
              <p className="text-[10px] text-zinc-500 truncate uppercase font-bold tracking-widest">Technician</p>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => setCollapsed(!collapsed)} className={cn("absolute -right-3 top-20 w-6 h-6 rounded-md flex items-center justify-center shadow-xl border transition-all z-50", isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white" : "bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900")}>
        {collapsed ? <ChevronRight size={12} strokeWidth={3} /> : <ChevronLeft size={12} strokeWidth={3} />}
      </button>
    </aside>
  );
};

export default LabSidebar;