import { useEffect, useRef, useState } from 'react';
import { ClinicDatabase, createDatabase } from '../db/database';
import { SyncManager } from '../db/sync-manager';

interface UseClinicSyncOptions {
  role: string;
  authToken: string;
  baseUrl: string;
  initialContext?: string;
}

interface SyncStatus {
  isReady: boolean;
  isSyncing: boolean;
  error: Error | null;
  currentContext: string;
}

export function useClinicSync(options: UseClinicSyncOptions) {
  const { role, authToken, baseUrl, initialContext = 'dashboard' } = options;
  
  const dbRef = useRef<ClinicDatabase | null>(null);
  const syncManagerRef = useRef<SyncManager | null>(null);
  
  const [status, setStatus] = useState<SyncStatus>({
    isReady: false,
    isSyncing: false,
    error: null,
    currentContext: initialContext
  });

  useEffect(() => {
    let isMounted = true;

    // IMPORTANT: Only run if we have auth credentials
    if (!role || !authToken) {
      console.warn("[RxDB-Sync] Missing role or authToken. Waiting for authentication...");
      return;
    }

    const init = async () => {
      console.group("[RxDB-Sync] Initialization Started");
      console.log(`[RxDB-Sync] Target Role: ${role}`);
      console.log(`[RxDB-Sync] Base URL: ${baseUrl}`);

      try {
        // --- STEP 1: CREATE DATABASE ---
        console.log("[RxDB-Sync] Step 1: Creating RxDatabase...");
        const db = await createDatabase(role);
        
        if (!isMounted) {
            console.log("[RxDB-Sync] Component unmounted during DB creation, aborting.");
            await db.destroy();
            return;
        }
        dbRef.current = db;
        console.log("[RxDB-Sync] Success: RxDatabase created.");

        // --- STEP 2: INITIALIZE SYNC MANAGER ---
        console.log("[RxDB-Sync] Step 2: Initializing SyncManager...");
        const syncManager = new SyncManager(db, role, baseUrl, authToken);
        syncManagerRef.current = syncManager;
        console.log("[RxDB-Sync] Success: SyncManager instance ready.");

        // --- STEP 3: SET READY (OFFLINE-FIRST) ---
        // We set isReady to true NOW so the UI can show whatever is in local storage
        console.log("[RxDB-Sync] Step 3: Setting UI status to READY (Offline-First).");
        setStatus(s => ({ 
            ...s, 
            isReady: true, 
            isSyncing: true, // Mark that we are about to start background sync
            error: null 
        }));

        // --- STEP 4: START BACKGROUND SYNC ---
        console.log(`[RxDB-Sync] Step 4: Starting background replication for context: ${initialContext}...`);
        
        try {
          // We don't necessarily "await" this for the UI to load, 
          // but we do it to manage the isSyncing state.
          await syncManager.startSync(initialContext);
          console.log("[RxDB-Sync] Success: Background replication active.");
        } catch (syncErr) {
          // If network is down, we don't crash, just log it.
          console.error("[RxDB-Sync] Background replication failed (Network Error):", syncErr);
        } finally {
          if (isMounted) {
            console.log("[RxDB-Sync] Finishing initial sync phase.");
            setStatus(s => ({ ...s, isSyncing: false }));
          }
        }

      } catch (err) {
        console.error("[RxDB-Sync] FATAL ERROR during initialization:", err);
        if (isMounted) {
          setStatus(s => ({
            ...s,
            error: err instanceof Error ? err : new Error('Unknown initialization error'),
            isSyncing: false,
            isReady: false // Only set to false if DB creation itself failed
          }));
        }
      } finally {
        console.groupEnd();
      }
    };

    init();

    return () => {
      console.log("[RxDB-Sync] Component unmounting. Cleaning up sync...");
      isMounted = false;
      syncManagerRef.current?.stopAll().catch(e => console.error("[RxDB-Sync] Cleanup error:", e));
      // We usually DON'T destroy the DB here in development to allow fast refresh
    };
  }, [role, authToken, baseUrl]); // Re-initialize only if identity or server changes

  // HELPER: Switch Sync Context (e.g. from Dashboard to Patient Search)
  const switchContext = async (newContext: string) => {
    if (!syncManagerRef.current || status.isSyncing) {
        console.warn("[RxDB-Sync] Switch context ignored: SyncManager not ready or already syncing.");
        return;
    }
    
    console.log(`[RxDB-Sync] Switching sync context to: ${newContext}`);
    setStatus(s => ({ ...s, isSyncing: true }));
    
    try {
      await syncManagerRef.current.startSync(newContext);
      setStatus(s => ({
        ...s,
        currentContext: newContext,
        isSyncing: false
      }));
      console.log(`[RxDB-Sync] Successfully switched to context: ${newContext}`);
    } catch (err) {
      console.error(`[RxDB-Sync] Failed to switch context to ${newContext}:`, err);
      setStatus(s => ({
        ...s,
        error: err instanceof Error ? err : new Error('Context switch failed'),
        isSyncing: false
      }));
    }
  };

  const pauseSync = () => {
    console.log("[RxDB-Sync] Pausing all replications.");
    syncManagerRef.current?.pauseAll();
  };

  const resumeSync = () => {
    console.log("[RxDB-Sync] Resuming all replications.");
    syncManagerRef.current?.resumeAll();
  };

  return {
    db: dbRef.current,
    syncManager: syncManagerRef.current,
    ...status,
    switchContext,
    pauseSync,
    resumeSync
  };
}