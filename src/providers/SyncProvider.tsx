import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthProvider';
import { useClinicSync } from '../hooks/useClinicSync'; // Adjust path if needed
import { ClinicDatabase } from '../db/database';
import { SyncManager } from '../db/sync-manager';

interface SyncContextType {
  db: ClinicDatabase | null;
  syncManager: SyncManager | null;
  isReady: boolean;
  isSyncing: boolean;
  error: Error | null;
  currentContext: string;
  switchContext: (newContext: string) => Promise<void>;
  pauseSync: () => void;
  resumeSync: () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  
  // Use environment variable or fallback to localhost
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Use the hook provided in your prompt
  // The hook only runs effectively when role and token are present
  const sync = useClinicSync({
    role: user?.role || '',
    authToken: token || '',
    baseUrl: baseUrl,
    initialContext: 'dashboard'
  });

  const value = useMemo(() => ({
    ...sync
  }), [sync]);

  return (
    <SyncContext.Provider value={value}>
      {children}
      
      {/* Global Syncing Indicator Overlay */}
      {sync.isSyncing && (
        <div className="fixed bottom-6 left-6 z-[9999] pointer-events-none">
          <div className="flex items-center gap-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 px-4 py-2 rounded-2xl shadow-2xl">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
              Synchronizing Local DB
            </span>
          </div>
        </div>
      )}
    </SyncContext.Provider>
  );
};

// Custom hook to use the Sync context
export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};