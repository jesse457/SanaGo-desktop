import React, { useEffect, useState, useRef } from "react";
import {
  Copy,
  RefreshCw,
  LogOut,
  User,
  Scissors,
  Clipboard,
  ChevronRight,
  Settings,
  UserPlus,
  Search,
  Shield,
  Activity,
  Stethoscope,
  FileText,
  Bell,
  Trash2,
} from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

interface ContextData {
  type: string;
  id: string | null;
  name: string | null;
}

const ContextMenu = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      // Look for data-context-type attributes on the target or its parents
      const target = (event.target as HTMLElement).closest("[data-context-type]");

      if (target) {
        event.preventDefault();
        const type = target.getAttribute("data-context-type") || "";
        const id = target.getAttribute("data-context-id");
        const name = target.getAttribute("data-context-name");

        setContextData({ type, id, name });

        const clickX = event.clientX;
        const clickY = event.clientY;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const menuW = 220;
        const menuH = 300;

        const x = clickX + menuW > screenW ? clickX - menuW : clickX;
        const y = clickY + menuH > screenH ? clickY - menuH : clickY;

        setPosition({ x, y });
        setVisible(true);
      } else {
        // Only show global menu if explicitly allowed or on empty space?
        // For now, let's keep it restricted to designated areas to avoid clutter
        setVisible(false);
      }
    };

    const handleClick = () => setVisible(false);
    const handleScroll = () => setVisible(false);

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className={`fixed z-[9999] w-64 border shadow-2xl rounded-2xl py-2 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${isDark
        ? "bg-zinc-900/90 border-zinc-800 text-zinc-300"
        : "bg-white/95 border-zinc-200 text-zinc-700"
        }`}
      style={{ top: position.y, left: position.x }}
    >
      {/* Dynamic Header */}
      {contextData?.name && (
        <div className="px-4 py-2 mb-1 border-b border-zinc-500/10">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">
            Context Actions
          </p>
          <p className="text-sm font-black text-primary-500 truncate mt-1">
            {contextData.name}
          </p>
        </div>
      )}

      {/* Render based on type */}
      {contextData?.type === "staff" && (
        <>
          <MenuItem icon={User} label="View Full Profile" />
          <MenuItem icon={Activity} label="View Performance" />
          <MenuItem icon={Bell} label="Send Private Note" />
          <MenuDivider />
          <MenuItem icon={Shield} label="Manage Permissions" />
          <MenuItem
            icon={Trash2}
            label="Remove from System"
            color="text-rose-500"
          />
        </>
      )}

      {contextData?.type === "patient" && (
        <>
          <MenuItem icon={Stethoscope} label="Start Consultation" />
          <MenuItem icon={FileText} label="Open History" />
          <MenuItem icon={Activity} label="Check Recent Vitals" />
          <MenuDivider />
          <MenuItem icon={Search} label="Search All Records" />
          <MenuItem
            icon={Copy}
            label="Copy Patient ID"
            onClick={() => {
              if (contextData.id) navigator.clipboard.writeText(contextData.id);
            }}
          />
        </>
      )}

      {contextData?.type === "activity" && (
        <>
          <MenuItem icon={Eye} label="View Detailed Log" />
          <MenuItem icon={User} label="Go to Staff Profile" />
          <MenuDivider />
          <MenuItem icon={Shield} label="Audit Security Event" />
        </>
      )}

      {/* Default/Common Actions */}
      {!contextData && (
        <>
          <MenuItem
            icon={RefreshCw}
            label="Refresh View"
            onClick={() => window.location.reload()}
          />
          <MenuItem icon={Search} label="Global Search" shortcut="Ctrl+F" />
        </>
      )}
    </div>
  );
};

interface MenuItemProps {
  icon?: any;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
}

const MenuItem = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled,
  color = "",
}: MenuItemProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold transition-all
      ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-primary-500 hover:text-white cursor-pointer group rounded-lg mx-2 w-[calc(100%-16px)]"}
    `}
  >
    <div className="flex items-center gap-3">
      {Icon && (
        <Icon
          size={16}
          strokeWidth={2.5}
          className={`${color || "text-zinc-500"} group-hover:text-white transition-colors`}
        />
      )}
      <span className={`${color} group-hover:text-white`}>{label}</span>
    </div>
    {shortcut && (
      <span className="text-[10px] font-black opacity-30 group-hover:opacity-100 group-hover:text-white">
        {shortcut}
      </span>
    )}
  </button>
);

const MenuDivider = () => <div className="h-px bg-zinc-500/10 my-1.5 mx-4" />;

const Eye = ({ size, ...props }: { size?: number | string;[key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default ContextMenu;
