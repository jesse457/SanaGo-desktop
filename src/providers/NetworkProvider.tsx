import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Activity, AlertTriangle } from "lucide-react";
import { apiClient } from "../services/authService";
import { currentState, subscribeToConnection } from "../echo";
interface NetworkContextType {
  isOnline: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export const NetworkProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    return () => subscribeToConnection(setIsOnline);
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}

      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 w-full z-[100] pointer-events-none p-4"
          >
            <div className="max-w-xl mx-auto pointer-events-auto">
              {/* This container matches your LoginPage "Security Node" card style */}
              <div className="bg-gray-100 dark:bg-zinc-950/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(244,63,94,0.1)]">
                <div className="px-4 py-2 flex items-center justify-between gap-4">
                  {/* Status Side */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black dark:text-white uppercase tracking-[0.2em] leading-none">
                        Offline Mode
                      </h4>
                      <p className="text-[9px] font-bold  text-rose-500/70 uppercase tracking-widest mt-1">
                        Displaying saved local data. New actions will sync When
                        online
                      </p>
                    </div>
                  </div>

                  {/* Visual Divider */}
                  <div className="h-8 w-px bg-zinc-800 hidden sm:block" />

                  {/* Action Side */}
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                        Attempting Reconnection
                      </p>
                      <div className="flex gap-1 justify-end mt-1">
                        {[1, 2, 3].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1,
                              delay: i * 0.2,
                            }}
                            className="w-1 h-1 bg-rose-500 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                      <Activity
                        className="text-rose-500 animate-pulse"
                        size={18}
                      />
                    </div>
                  </div>
                </div>

                {/* Slim scanning line animation at bottom */}
                <div className="h-[1px] w-full dark:bg-zinc-800 relative overflow-hidden">
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "linear",
                    }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-rose-500 to-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NetworkContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkContext);
