import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, LoginData, RegisterData } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeApiUserToStoredUser } from '../utils/normalizeUser';
import { registerForPushNotificationsAsync, syncPushTokenToBackend } from '../services/notificationService';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  dash_pass?: boolean;
  is_admin?: boolean;
  is_restaurant?: boolean;
  is_driver?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const storedUser = await authService.getUser();

      if (!token || !storedUser) {
        if (storedUser) await AsyncStorage.removeItem('user');
        setUser(null);
        return;
      }

      setUser(storedUser);

      try {
        const fresh = await authService.fetchUserFromApi();
        setUser(normalizeApiUserToStoredUser(fresh));
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          setUser(null);
        }
      }

      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) await syncPushTokenToBackend(pushToken);
      } catch {
        /* ignore */
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    setUser(normalizeApiUserToStoredUser(response.user));
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) await syncPushTokenToBackend(token);
    } catch {
      /* ignore */
    }
  };

  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(normalizeApiUserToStoredUser(response.user));
    try {
      const token = await registerForPushNotificationsAsync();
      if (token) await syncPushTokenToBackend(token);
    } catch {
      /* ignore */
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; phone?: string }) => {
    const response = await authService.updateProfile(data);
    setUser(normalizeApiUserToStoredUser(response.user));
  };

  const refreshUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const stored = await authService.getUser();
      if (!token || !stored) {
        setUser(null);
        return;
      }

      setUser(stored);

      try {
        const fresh = await authService.fetchUserFromApi();
        setUser(normalizeApiUserToStoredUser(fresh));
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) await syncPushTokenToBackend(pushToken);
        } catch {
          /* ignore */
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          setUser(null);
        }
      }
    } catch {
      /* keep current session on local storage read errors */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
