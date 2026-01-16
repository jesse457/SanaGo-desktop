import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Activity, AlertCircle } from "lucide-react";

interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Direct connectivity check - Optimized for Electron
  const checkProtocol = async () => {
    try {
      // 1. Check navigator first (Hardware check)
      if (!navigator.onLine) return false;

      // 2. Ping a reliable "No Content" endpoint (Standard Connectivity Check)
      // clients3.google.com/generate_204 is faster/safer than 8.8.8.8 for SSL
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

      await fetch(`https://clients3.google.com/generate_204?_=${Date.now()}`, {
        mode: "no-cors",
        cache: "no-store",
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true;
    } catch (e) {
      return false;
    }
  };

  useEffect(() => {
    const updateStatus = async () => {
      const actualStatus = await checkProtocol();

      // Only toggle state if it actually changed to prevent render loops
      setIsOnline((prev) => {
        if (actualStatus !== prev) {
          if (actualStatus) {
            toast.success("SYSTEM ONLINE", {
              description: "Network synchronization re-established.",
              icon: <Wifi className="text-emerald-500" size={16} />,
            });
          } else {
            toast.error("SYSTEM OFFLINE", {
              description: "Protocol shifted to local storage mode.",
              icon: <WifiOff className="text-rose-500" size={16} />,
            });
          }
          return actualStatus;
        }
        return prev;
      });
    };

    // 1. Listen for hardware events (immediate)
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // 2. Real-time Heartbeat (Check every 10 seconds to save resources)
    const heartbeat = setInterval(updateStatus, 10000);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      clearInterval(heartbeat);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} // Slide from under titlebar
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "circOut" }}
            // FIX: top-[42px] places it exactly below the TitleBar
            // FIX: z-[90] ensures it stays below TitleBar dropdowns but above content
            className="fixed top-[42px] left-0 w-full z-[90] pointer-events-none"
          >
            <div className="bg-rose-600 dark:bg-rose-900/95 text-white px-6 py-2 flex items-center justify-between shadow-xl border-b border-rose-500/30 pointer-events-auto backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-50">
                  Connection Lost
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 opacity-80">
                  <Activity size={12} className="animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Local Mode Active</span>
                </div>
                <div className="h-4 w-px bg-white/20 hidden sm:block" />
                <AlertCircle size={16} strokeWidth={2.5} className="text-rose-100" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NetworkContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkContext);