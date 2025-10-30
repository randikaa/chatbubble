'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

interface StoredAuth {
  user: User;
  expiresAt: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    try {
      const storedAuth = localStorage.getItem('chatbubble_auth');
      if (storedAuth) {
        const { user: storedUser, expiresAt }: StoredAuth = JSON.parse(storedAuth);
        
        // Check if session is still valid (not expired)
        if (Date.now() < expiresAt) {
          setUser(storedUser);
        } else {
          // Session expired, clear it
          localStorage.removeItem('chatbubble_auth');
        }
      }
    } catch (error) {
      console.error('Error loading auth:', error);
      localStorage.removeItem('chatbubble_auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (user: User) => {
    // Set expiration to 1 month from now
    const oneMonthFromNow = Date.now() + (30 * 24 * 60 * 60 * 1000);
    
    const authData: StoredAuth = {
      user,
      expiresAt: oneMonthFromNow,
    };
    
    setUser(user);
    localStorage.setItem('chatbubble_auth', JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chatbubble_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
