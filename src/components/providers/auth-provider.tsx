"use client";

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AuthRole = "customer" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  setSession: (session: AuthSession | null) => void;
  logout: () => void;
}

const STORAGE_KEY = "zion-car-rentals-auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const stored = JSON.parse(raw) as AuthSession;
        if (stored?.token && stored?.user) {
          setUser(stored.user);
          setToken(stored.token);
        }
      }
    } catch (error) {
      console.error("Failed to restore auth session", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((session: AuthSession | null) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!session) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, []);

  const setSession = useCallback(
    (session: AuthSession | null) => {
      if (session) {
        setUser(session.user);
        setToken(session.token);
      } else {
        setUser(null);
        setToken(null);
      }

      persistSession(session);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    setSession(null);
  }, [setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      setSession,
      logout,
    }),
    [user, token, isLoading, setSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

