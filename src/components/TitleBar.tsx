import React, { useEffect } from "react";
import {
  Activity,
  Bell,
  Sun,
  Moon,
  Minus,
  Square,
  X,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useNetworkStatus } from "../providers/NetworkProvider";
import { useTheme } from "../providers/ThemeProvider";
import { usePlatform } from "../hooks/usePlatform";

/**
 * TitleBar component provides a custom desktop-style title bar with
 * window controls.
 */
const TitleBar = ({ children }: { children?: React.ReactNode }) => {
  const { isOnline } = useNetworkStatus();
  const { theme, toggleTheme } = useTheme();
  const { isMac, isWindows, isLinux } = usePlatform();
  const isDark = theme === "dark";

  // Sync with Electron TitleBarOverlay
  useEffect(() => {
    if (window.electronAPI?.updateTitleBar) {
      const config: Record<string, any> = {
        dark: {
          backgroundColor: "#09090b",
          symbolColor: "#ffffff",
          theme: "dark",
        },
        light: {
          backgroundColor: "#ffffff",
          symbolColor: "#000000",
          theme: "light",
        },
      };
      window.electronAPI.updateTitleBar(config[theme] || config.light);
    }
  }, [theme]);

  // Window Controls Handlers
  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <div
      className={cn(
        "h-[42px] w-full shrink-0 flex items-center justify-between pl-4 pr-2 select-none z-[100] border-b transition-colors duration-300 relative",
        isDark
          ? "bg-zinc-950 text-zinc-400 border-zinc-800"
          : "bg-white text-zinc-600 border-zinc-200"
      )}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* 1. LEFT SECTION: App Brand */}
      <div className={cn("flex items-center gap-3 shrink-0", isMac && "pl-[72px]")}>
        <div className="flex items-center gap-2.5 no-drag">
          <div
            className={cn(
              "p-1 rounded-md border transition-colors",
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-zinc-100 border-zinc-200"
            )}
          >
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span
            className={cn(
              "text-[12px] font-bold tracking-tight transition-colors hidden sm:inline-block",
              isDark ? "text-zinc-100" : "text-zinc-800"
            )}
          >
            SanaGo
          </span>
        </div>
      </div>

      {/* 
         2. CENTER SECTION: Tabs / Children 
         Added 'min-w-0' to prevent flex items from refusing to shrink, 
         ensuring tabs stay visible and don't get pushed out.
      */}
      <div className="flex-1 px-4 h-full flex items-center overflow-hidden min-w-0 no-drag">
        {children}
      </div>

      {/* 3. RIGHT SECTION: Network, Actions, Window Controls */}
      <div
        className={cn(
          "flex items-center gap-3 h-full shrink-0 transition-all duration-300",
          isWindows && "pr-[138px]"
        )}
      >
        {/* Network Status - Now collapses to icon-only on small screens */}
        <NetworkIndicator isOnline={isOnline} isDark={isDark} />

        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <div className="flex items-center gap-1.5 no-drag">
          <ActionButton
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            isDark={isDark}
          >
            {isDark ? (
              <Sun size={15} strokeWidth={2.5} />
            ) : (
              <Moon size={15} strokeWidth={2.5} />
            )}
          </ActionButton>

          <ActionButton isDark={isDark} title="Notifications">
            <Bell size={15} strokeWidth={2.5} />
          </ActionButton>
        </div>

        {/* 4. LINUX BUTTONS */}
        {isLinux && (
          <div className="flex items-center no-drag ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
            <CaptionButton icon={Minus} onClick={handleMinimize} />
            <CaptionButton icon={Square} onClick={handleMaximize} />
            <CaptionButton icon={X} onClick={handleClose} isClose />
          </div>
        )}
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const NetworkIndicator = ({
  isOnline,
  isDark,
}: {
  isOnline: boolean;
  isDark: boolean;
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-full border text-[10px] font-bold no-drag transition-all duration-300",
        // When online: Minimalist look
        // When offline: Red alert look
        isOnline
          ? isDark
            ? "bg-transparent border-transparent text-zinc-500" // Subtle when online
            : "bg-transparent border-transparent text-zinc-400"
          : isDark
          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
          : "bg-rose-50 border-rose-200 text-rose-600"
      )}
      title={isOnline ? "Network Stable" : "No Internet Connection"}
    >
      {isOnline ? (
        // Online Icon (Subtle)
        <Wifi size={14} strokeWidth={2.5} className="opacity-70" />
      ) : (
        // Offline Icon (Pulsing Red)
        <WifiOff size={14} strokeWidth={2.5} className="animate-pulse" />
      )}
      
      {/* 
         Text Logic:
         - Hidden by default on small screens to save space for Tabs.
         - Visible only on Medium (md) screens and up.
         - Even if offline, it won't block tabs on small windows now.
      */}
      <span className={cn(
        "hidden md:inline-block", 
        isOnline && "hidden xl:inline-block" // Online text only on huge screens
      )}>
        {isOnline ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
};

const ActionButton = ({
  children,
  onClick,
  title,
  isDark,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  isDark: boolean;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "p-1.5 rounded-lg transition-all border outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
      isDark
        ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
        : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200"
    )}
    title={title}
  >
    {children}
  </button>
);

const CaptionButton = ({
  icon: Icon,
  onClick,
  isClose,
}: {
  icon: any;
  onClick: () => void;
  isClose?: boolean;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-md group outline-none",
        isClose && "hover:bg-rose-500 dark:hover:bg-rose-500"
      )}
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5 transition-colors",
          isDark
            ? "text-zinc-400 group-hover:text-zinc-100"
            : "text-zinc-500 group-hover:text-zinc-900",
          isClose && "group-hover:text-white"
        )}
        strokeWidth={3}
      />
    </button>
  );
};

export default TitleBar;