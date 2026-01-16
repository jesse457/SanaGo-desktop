// src/services/api/authService.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storageService } from './StorageService'; // Ensure path is correct

// --- Interfaces ---
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant_id: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// --- Axios Instance ---
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api', // Adjust to your API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Use the bridge to get the token
  if (window.electronAPI) {
    const token = await window.electronAPI.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth Service ---
export const authService = {
  
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    // 1. Network Request
    const response = await apiClient.post<LoginResponse>('/login', {
      ...credentials,
      device_name: 'electron-app'
    });

    // 2. Persist User for Offline Mode
    if (response.data.user) {
      await storageService.save(storageService.KEYS.USER_PROFILE, response.data.user);
    }

    return response.data;
  },

  fetchUser: async (): Promise<User> => {
    try {
      // 1. Try Network
      const response = await apiClient.get<User>('/user');
      
      // 2. Update Cache
      await storageService.save(storageService.KEYS.USER_PROFILE, response.data);
      return response.data;

    } catch (error) {
      console.warn("Network failed, checking offline storage for user profile...");
      
      // 3. Fallback to Offline Storage
      const cachedUser = await storageService.get<User>(storageService.KEYS.USER_PROFILE);
      
      if (cachedUser) {
        return cachedUser;
      }
      // If neither works, throw error
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } catch (e) { /* ignore API errors on logout */ }
    
    // 4. Cleanup Local Data
    if (window.electronAPI) {
      await window.electronAPI.deleteToken();
    }
    await storageService.remove(storageService.KEYS.USER_PROFILE);
    await storageService.remove(storageService.KEYS.DASHBOARD_STATS);
  }
};

export { apiClient }; // Export axios instance for use in other services