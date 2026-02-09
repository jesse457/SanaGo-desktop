import { useState, useEffect, useCallback, useRef } from "react";
import { storageService } from "../services/StorageService";

interface UseOfflineSyncOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onUnauthorized?: () => void;
}

export function useOfflineSync<T>({
  key,
  fetchFn,
  autoRefresh = true,
  refreshInterval = 120000, // 2 minutes
  onUnauthorized,
}: UseOfflineSyncOptions<T>) {
  // 1. State (The UI variables)
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Stability (The "Frozen" instructions to prevent infinite loops)
  const latestFetch = useRef(fetchFn);
  const latestAuth = useRef(onUnauthorized);
  const isMounted = useRef(true);

  // Keep our "Frozen" instructions up to date
  useEffect(() => {
    latestFetch.current = fetchFn;
    latestAuth.current = onUnauthorized;
    isMounted.current = true;
    return () => { isMounted.current = false; };
  });

  // 3. The Worker (Network Sync)
  const sync = useCallback(async () => {
    if (!isMounted.current) return;
    setIsSyncing(true);

    try {
      // Execute the "Frozen" function safely
      const freshData = await latestFetch.current();
      
      // Update UI and Cache
      if (isMounted.current) {
        setData(freshData);
        setError(null);
        await storageService.save(key, freshData);
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err);
      
      // Handle Unauthorized (401)
      if (err.response?.status === 401) {
        latestAuth.current?.();
      }
    } finally {
      if (isMounted.current) setIsSyncing(false);
    }
  }, [key]);

  // 4. The Lifecycle (Startup & Automation)
  useEffect(() => {
    const startUp = async () => {
      // Step A: Show Cached Data Immediately
      const cached = await storageService.get<T>(key);
      if (isMounted.current && cached) {
        setData(cached);
        setIsLoading(false); // Stop "Loading..." spinner because we have data
       
      }

      // Step B: Fetch Fresh Data in Background
      await sync();
      if (isMounted.current) setIsLoading(false);
    };

    startUp();

    // Step C: Setup Auto-Refresh Timer
    if (autoRefresh) {
      const timerId = setInterval(sync, refreshInterval);
      return () => clearInterval(timerId);
    }
  }, [key, sync, autoRefresh, refreshInterval]);

  return { data, isLoading, isSyncing, error, refetch: sync };
}