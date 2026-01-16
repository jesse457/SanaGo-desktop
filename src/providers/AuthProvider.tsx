import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, authService } from '../services/api/authService'; // Import from your api file
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check for stored token on app launch
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await window.electronAPI.getToken();
        if (storedToken) {
          setToken(storedToken);
          // Optional: Verify token validity by fetching user profile
          const userProfile = await authService.fetchUser();
          setUser(userProfile);
        }
      } catch (error) {
        console.error("Session restoration failed", error);
        await window.electronAPI.deleteToken(); // Clean up invalid token
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    // Save to Electron Secure Storage
    await window.electronAPI.saveToken(newToken);
  };

  const logout = async () => {
    await authService.logout(); // Call API logout
    setToken(null);
    setUser(null);
    await window.electronAPI.deleteToken(); // Clear from storage
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading, 
        login, 
        logout, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};