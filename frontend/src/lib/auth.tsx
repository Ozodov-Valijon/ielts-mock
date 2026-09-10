'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from './types';
import { api } from './api';
import { useRouter } from 'next/navigation';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  full_name: string;
  password: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await api.getMe();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.warn("Sessiya eskirgan yoki xato:", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const res = await api.login(data);
      if (!res.access_token) {
        throw new Error("Token olinmadi");
      }
      localStorage.setItem('token', res.access_token);
      setToken(res.access_token);
      
      const userData = await api.getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      if (userData.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Login muvaffaqiyatsiz bo'ldi";
      throw new Error(msg);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await api.register(data);
      router.push('/login');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Ro'yxatdan o'tishda xatolik yuz berdi";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
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
