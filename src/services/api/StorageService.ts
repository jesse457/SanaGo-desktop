export const storageService = {
  /**
   * Keys used in the application to prevent typos
   */
  KEYS: {
    USER_PROFILE: 'user_profile',
    DASHBOARD_STATS: 'dashboard_stats',
    PATIENT_LIST: 'patient_list',
    APPOINTMENTS_LIST: 'appointments_list',
    SETTINGS: 'app_settings'
    
  },

  /**
   * Save data securely
   */
  save: async (key: string, data: any): Promise<boolean> => {
    return await window.electronAPI.secureSet(key, data);
  },

  /**
   * Retrieve data
   */
  get: async <T>(key: string): Promise<T | null> => {
    return await window.electronAPI.secureGet<T>(key);
  },

  /**
   * Clear specific data
   */
  remove: async (key: string): Promise<boolean> => {
    return await window.electronAPI.secureDelete(key);
  }
};