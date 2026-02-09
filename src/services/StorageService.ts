// Ensure 'electron.d.ts' is in your TS compilation path for window.electronAPI to work

export const storageService = {
  KEYS: {
    USER_PROFILE: 'user_profile',
    DASHBOARD_STATS: 'dashboard_stats',
    PATIENT_LIST: 'patient_list',
    APPOINTMENTS_LIST: 'appointments_list',
    SETTINGS: 'app_settings'
  },

  save: async (key: string, data: any): Promise<boolean> => {
    return await window.electronAPI.secureSet(key, data);
  },

  // Fixed Generics here
  get: async <T>(key: string): Promise<T | null> => {
    // Explicit casting is handled by the Bridge, 
    // but in TS we must assert the return type from the generic invoke
    return (await window.electronAPI.secureGet(key)) as T | null;
  },

  remove: async (key: string): Promise<boolean> => {
    return await window.electronAPI.secureDelete(key);
  },

   // This triggers the nuclear option: delete everything in the store
  clearAll: async (): Promise<boolean> => {
    return await window.electronAPI.secureClear();
  }
};