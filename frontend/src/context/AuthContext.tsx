import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

interface User {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Record<string, any>) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('chessChronicleToken'));

  const loadUser = async () => {
    const savedToken = localStorage.getItem('chessChronicleToken');
    if (!savedToken) return;

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user || null);
    } catch (error) {
      localStorage.removeItem('chessChronicleToken');
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const nextToken = res.data.token;
    localStorage.setItem('chessChronicleToken', nextToken);
    setToken(nextToken);
    setUser(res.data.user);
  };

  const register = async (payload: Record<string, any>) => {
    const res = await api.post('/auth/register', payload);
    const nextToken = res.data.token;
    localStorage.setItem('chessChronicleToken', nextToken);
    setToken(nextToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('chessChronicleToken');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, login, register, logout, loadUser }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
