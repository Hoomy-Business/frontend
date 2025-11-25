import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { User } from '@shared/schema';
import { apiRequest } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isStudent: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setLocation('/');
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await apiRequest<{ user: User }>('GET', '/auth/profile');
      if (response.user) {
        setUser(response.user);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      // Si le token est invalide, déconnecter l'utilisateur
      if (error instanceof Error && error.message.includes('401')) {
        logout();
      }
    }
  };

  // Recharger le profil utilisateur au montage si connecté
  useEffect(() => {
    if (token && user) {
      refreshUser();
    }
  }, [token]); // Seulement au montage ou si le token change

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!token,
    isStudent: user?.role === 'student',
    isOwner: user?.role === 'owner',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}
