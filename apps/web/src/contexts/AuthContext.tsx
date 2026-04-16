'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

import type { User } from '@fairchain/shared';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from httpOnly cookie on mount
  useEffect(() => {
    void restore();
  }, []);

  const restore = async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = (await res.json()) as { user: User };
        setUser(data.user);
        setToken('cookie-session'); // Real JWT is in httpOnly cookie
      }
    } catch {
      // No active session — that's fine
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback((newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken || 'cookie-session');
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Swallow — we clear state regardless
    }
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
