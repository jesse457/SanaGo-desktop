import React, { useState, useRef, useEffect } from "react";
import { Bell, Sun, Moon, CheckCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../utils/cn";
import { useNetworkStatus } from "../providers/NetworkProvider";
import { usePlatform } from "../hooks/usePlatform";
import { useNotifications } from "../providers/NotificationProvider";
import { NetworkIndicator, NotificationItemRow } from "./TitleBarComponents";
import { NewNotificationModal } from "./NewNotificationModal";

import logo from "../assets/logo.png";

const TitleBar = ({ children }: { children?: React.ReactNode }) => {
  const { isOnline } = useNetworkStatus();
  const { isMac } = usePlatform();
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    latestNotification,
    showModal,
    setShowModal,
  } = useNotifications();

  const [showDropdown, setShowDropdown] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine if we have unread API/System notifications
  const hasUnread = unreadCount > 0;

  const toggleTheme = () => {
    const willBeDark = !isDark;
    document.documentElement.classList.toggle("dark", willBeDark);
    localStorage.setItem("theme", willBeDark ? "dark" : "light");
    setIsDark(willBeDark);
    if (window.electronAPI?.updateTitleBar) {
      window.electronAPI.updateTitleBar({
        theme: willBeDark ? "dark" : "light",
        backgroundColor: willBeDark ? "#09090b" : "#ffffff",
        symbolColor: willBeDark ? "#ffffff" : "#3f3f46",
      });
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  return (
    <>
      <header
        className="h-[40px] w-full flex items-center justify-between px-3 select-none z-[100] border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
        style={{ WebkitAppRegion: "drag" } as any}
      >
        {/* LEFT: Logo */}
        <div
          className={cn(
            "flex items-center gap-3 shrink-0",
            isMac && "pl-[72px]",
          )}
        >
          <div className="flex items-center gap-2.5 no-drag cursor-default">
            <img src={logo} alt="Logo" className="w-6 h-6 object-contain" />
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-100">
              SanaGo
            </span>
          </div>
        </div>

        <div className="flex-1 flex justify-center h-full no-drag">
          {children}
        </div>

        <div
          className={cn(
            "flex items-center gap-1.5 h-full shrink-0 no-drag pr-[120px]",
          )}
        >
          <NetworkIndicator isOnline={isOnline} />
          <button
            onClick={toggleTheme}
            className="relative flex h-7 w-[64px] items-center rounded-full bg-zinc-200/50 p-1 transition-colors hover:bg-zinc-200 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
            aria-label="Toggle Theme"
          >
            {/* Sliding Indicator */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 30 }}
              className="absolute h-6 w-6 rounded-full bg-white shadow-sm dark:bg-zinc-950"
              animate={{ x: isDark ? 32 : 0 }}
            />

            {/* Icons */}
            <div className="relative flex w-full justify-between px-1 text-zinc-500 dark:text-zinc-400">
              <Sun size={14} className={cn(!isDark ? "text-amber-500" : "")} />
              <Moon size={14} className={cn("ms-2",isDark ? "text-blue-400" : "")} />
            </div>
          </button>

          {/* NOTIFICATION SECTION */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg transition-all relative",
                hasUnread
                  ? "text-rose-500"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-900",
                showDropdown && "bg-rose-500/10",
              )}
            >
              {/* Bell Icon with Red Alert Wiggle */}
              <Bell
                size={15}
                className={cn(
                  hasUnread && "animate-[wiggle_1s_ease-in-out_infinite]",
                )}
              />

              {/* THE RED ALERT COUNT BADGE */}
              {hasUnread && (
                <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                  {/* Pulsing outer ring */}
                  <span className="absolute w-full h-full bg-rose-500 rounded-full animate-ping opacity-60" />

                  {/* The Actual Count Circle */}
                  <span className="relative min-w-[15px] h-[15px] px-1 bg-rose-500 text-white text-[9px] font-black rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </div>
              )}
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute top-[38px] right-0 w-[320px] rounded-xl border shadow-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        Alerts
                      </span>
                      {hasUnread && (
                        <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[7px] font-black animate-pulse flex items-center gap-1">
                          <AlertCircle size={8} /> {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCheck size={12} /> Mark read
                    </button>
                  </div>

                  {/* Body */}
                  <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell
                          size={20}
                          className="mx-auto mb-2 opacity-10 text-zinc-500"
                        />
                        <span className="text-zinc-400 text-[11px]">
                          No active notifications
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {notifications.map((n) => (
                          <NotificationItemRow key={n.id} notification={n} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Real-time Pop-up Modal */}
      <NewNotificationModal
        show={showModal}
        notification={latestNotification}
        onClose={() => setShowModal(false)}
      />

      {/* Global CSS for the Wiggle effect */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }
      `,
        }}
      />
    </>
  );
};

export default TitleBar;
