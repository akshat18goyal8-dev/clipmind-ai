import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (e: string, u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const u = await authService.getMe();
        setUser(u);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (username_or_email: string, pass: string) => {
    const res = await authService.login(username_or_email, pass);
    localStorage.setItem('clipmind_token', res.access_token);
    setUser(res.user);
  };

  const register = async (email: string, username: string, pass: string) => {
    const res = await authService.register(email, username, pass);
    localStorage.setItem('clipmind_token', res.access_token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('clipmind_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
