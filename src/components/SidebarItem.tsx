import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../utils/cn";

interface SidebarItemProps {
  label: string;
  to: string;
  icon: React.ElementType;
  collapsed: boolean;
  isDark: boolean;
  activeColor?: "indigo" | "blue";
}

/**
 * Common SidebarItem component used in both Admin and Doctor sidebars.
 */
const SidebarItem: React.FC<SidebarItemProps> = ({
  label,
  to,
  icon: Icon,
  collapsed,
  isDark,
  activeColor = "indigo",
}) => {
  const activeStyles = {
    indigo: isDark
      ? "bg-primary-600/10 text-primary-400 border-primary-500/20 shadow-[0_0_15px_rgba(79,70,229,0.1)]"
      : "bg-primary-50 text-primary-700 border-primary-100 shadow-sm",
    blue: isDark
      ? "bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
      : "bg-blue-50 text-blue-700 border-blue-100 shadow-sm",
  };

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center w-full px-3 py-2.5 rounded-xl transition-all duration-200 outline-none border",
          isActive
            ? activeStyles[activeColor]
            : isDark
              ? "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border-transparent"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border-transparent",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.5 : 2}
            className="shrink-0"
          />

          {!collapsed && (
            <span className="ml-3 text-[13px] font-semibold whitespace-nowrap overflow-hidden animate-in slide-in-from-left-2 duration-300">
              {label}
            </span>
          )}

          {collapsed && (
            <div
              className={cn(
                "absolute left-16 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 z-[100] whitespace-nowrap border shadow-2xl text-[11px] font-bold tracking-tight",
                isDark
                  ? "bg-zinc-900 text-white border-zinc-800"
                  : "bg-white text-zinc-900 border-zinc-200",
              )}
            >
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
