import Echo from "laravel-echo";
import Pusher from "pusher-js";

export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  readFiles: () => Promise<string[] | { error: string }>;
  createFile: () => Promise<string | { error: string }>;
  updateTitleBar: (config: {
    backgroundColor?: string;
    symbolColor?: string;
    theme?: "light" | "dark" | "system";
  }) => void;
  getSystemTheme: () => Promise<"light" | "dark">;
  getNetworkStatus: () => Promise<{ online: boolean }>;
  platform: string;
  getToken: () => Promise<string | null>;
  saveToken: (token: string) => Promise<boolean>;
  deleteToken: () => Promise<boolean>;
  secureSet: (key: string, data: any) => Promise<boolean>;
  secureGet: <T>(key: string) => Promise<T | null>;
  secureDelete: (key: string) => Promise<boolean>;
  secureClear: () => Promise<boolean>;
}

declare global {
  interface Window {
    /** Custom Electron API via Preload script */
    electronAPI: ElectronAPI;
    
    /** Laravel Echo instance for real-time notifications */
    Echo: Echo;
    
    /** Pusher class constructor (required by Echo) */
    Pusher: typeof Pusher;
  }
}