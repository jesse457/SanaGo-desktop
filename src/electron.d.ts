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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
