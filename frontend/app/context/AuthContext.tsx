'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserResponse, login as apiLogin, register as apiRegister, getMe, updateMyProfile } from '../../lib/api';

interface AuthContextType {
  user: UserResponse | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserResponse>;
  register: (email: string, password: string, fullName: string) => Promise<UserResponse>;
  logout: () => void;
  updateProfile: (fullName?: string, avatarUrl?: string) => Promise<UserResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        if (storedToken) {
          setToken(storedToken);
          const me = await getMe();
          setUser(me);
        }
      } catch (err) {
        console.error('Failed to bootstrap auth session:', err);
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem('accessToken', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await apiRegister({ email, password, fullName });
    localStorage.setItem('accessToken', res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const updateProfile = async (fullName?: string, avatarUrl?: string) => {
    const updatedUser = await updateMyProfile({ fullName, avatarUrl });
    setUser(updatedUser);
    return updatedUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
