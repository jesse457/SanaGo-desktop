// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, authService } from "../services/authService";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { storageService } from "../services/StorageService";
import { setupEcho } from "../echo";
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSyncing: boolean; // Optional: show a small spinner in the corner?
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  // Helper to sync token with Electron on mount
  useEffect(() => {
    const loadToken = async () => {
      const stored = await window.electronAPI.getToken();
      if (stored) setToken(stored);
    };
    loadToken();
  }, []);

  // --- THE NEW OFFLINE LOGIC ---
  // This will:
  // 1. Load User from file immediately (instant UI)
  // 2. Fetch API in background
  // 3. Refresh API every 2 mins
  const {
    data: user,
    isLoading: userLoading,
    isSyncing,
  } = useOfflineSync<User>({
    key: storageService.KEYS.USER_PROFILE,
    fetchFn: authService.fetchUser,
    autoRefresh: !!token, // Only poll if we have a token
    onUnauthorized: async () => {
      // If 401 happens during polling, log the user out
      await logout();
    },
  });

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setupEcho(newToken);
    await window.electronAPI.saveToken(newToken);
    // Note: The hook handles saving the user, but we can update the cache manually
    // here to ensure the UI updates instantly before the next poll cycle.
    await storageService.save(storageService.KEYS.USER_PROFILE, newUser);
  };

  const logout = async () => {
    setToken(null);
   
    await authService.logout();
  };

  // derived loading state
  const isLoading = userLoading && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isSyncing,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
