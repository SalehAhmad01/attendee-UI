import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient, setSignOutHandler } from '../api/client';

export interface User {
  id: number;
  email: string;
  full_name: string;
  date_joined?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const ACCESS_KEY = 'geoqr_access_token';
const REFRESH_KEY = 'geoqr_refresh_token';
const USER_KEY = 'geoqr_user_cache';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_KEY);
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch (e) {
      console.warn('Error clearing tokens:', e);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    setSignOutHandler(() => {
      logout();
    });

    const bootstrapAuth = async () => {
      try {
        const cachedUser = await SecureStore.getItemAsync(USER_KEY);
        const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);

        if (accessToken && cachedUser) {
          setUser(JSON.parse(cachedUser));
          // Verify with server in the background
          apiClient
            .get('/auth/me/')
            .then(async (res) => {
              if (res.data?.user) {
                setUser(res.data.user);
                await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.data.user));
              }
            })
            .catch(() => {
              // Token might be refreshed by interceptor or expired
            });
        }
      } catch (e) {
        console.warn('Error loading initial auth state:', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login/', { email, password });
    const { user: userData, access, refresh } = res.data;

    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

    setUser(userData);
  };

  const register = async (email: string, password: string, fullName?: string) => {
    const res = await apiClient.post('/auth/register/', {
      email,
      password,
      full_name: fullName || '',
    });
    const { user: userData, access, refresh } = res.data;

    await SecureStore.setItemAsync(ACCESS_KEY, access);
    await SecureStore.setItemAsync(REFRESH_KEY, refresh);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));

    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const res = await apiClient.get('/auth/me/');
      if (res.data?.user) {
        setUser(res.data.user);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(res.data.user));
      }
    } catch (e) {
      console.warn('Could not refresh user profile:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
