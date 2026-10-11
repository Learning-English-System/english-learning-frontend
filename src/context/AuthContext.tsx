import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type LearnerProfile } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  profile: LearnerProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const p = await api.getProfile();
      setProfile(p);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setProfile(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    await api.login(email, pass);
    await refreshProfile();
  };

  const register = async (email: string, pass: string, name: string) => {
    await api.register(email, pass, name);
  };

  const verifyEmail = async (email: string, token: string) => {
    await api.verifyEmail(email, token);
  };

  const logout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, profile, loading, login, register, verifyEmail, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
