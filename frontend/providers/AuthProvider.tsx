'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AuthContextType = {
  user: { id: string; email: string } | null;
  signIn: (user: { id: string; email: string }) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const signIn = (userData: { id: string; email: string }) => {
    setUser(userData);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('authUser');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}