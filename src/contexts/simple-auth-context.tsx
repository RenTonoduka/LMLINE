'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface SimpleUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SimpleAuthContextType {
  user: SimpleUser | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        const userData = result.data.user;
        setUser(userData);
        
        // Store auth data in localStorage
        localStorage.setItem('authToken', result.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('ログインしました！');
      } else {
        toast.error(result.error || 'ログインに失敗しました');
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('ログインエラーが発生しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.success('ログアウトしました');
  };

  const value: SimpleAuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}

export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};