import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";
import { storageService } from "./StorageService";

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
const baseUrl = import.meta.env.VITE_BASE_URL;

// --- Axios Setup ---
const apiClient: AxiosInstance = axios.create({
  baseURL: `${baseUrl}/api` ,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // Important for differentiating offline vs hung requests
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (window.electronAPI) {
      const token = await window.electronAPI.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Service ---
export const authService = {
  login: async (credentials: LoginPayload): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/login", {
      ...credentials,
      device_name: "electron-app",
    });
    console.log(response);
    if (response.data.user) {
      // Async storage: don't await if you want UI to update instantly,
      // but waiting ensures consistency.
      await storageService.save(
        storageService.KEYS.USER_PROFILE,
        response.data.user,
      );
    }

    return response.data;
  },

  fetchUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>("/user");
      await storageService.save(
        storageService.KEYS.USER_PROFILE,
        response.data,
      );
      return response.data;
    } catch (error) {
      console.warn("API Error, attempting offline fallback...");

      const cachedUser = await storageService.get<User>(
        storageService.KEYS.USER_PROFILE,
      );

      // If we have a cached user, return it even if network failed
      if (cachedUser) {
        return cachedUser;
      }

      // Otherwise, throw the original error (likely 401 or Net Error)
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log(baseUrl);
      await apiClient.post("/logout");
      if (window.electronAPI) {
        // This calls store.clear() in main process
        await storageService.clearAll();
      }
    } catch (e) {
      // Ignore network errors during logout
      console.log(e)
    }
  },
};

export { apiClient };
