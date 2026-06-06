"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { canMutate } from "@/lib/permissions";
import type { AppUser } from "@/lib/types";

type AuthStatus = "loading" | "authenticated" | "forbidden" | "unauthenticated";

type AuthContextValue = {
  user: AppUser | null;
  status: AuthStatus;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      if (res.status === 403) {
        setUser(null);
        setStatus("forbidden");
        return;
      }
      if (!res.ok) {
        setUser(null);
        setStatus("forbidden");
        return;
      }
      const data = (await res.json()) as { user: AppUser };
      setUser(data.user);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("forbidden");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, status, refresh }),
    [user, status, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppUser(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAppUser must be used within AuthProvider");
  }
  return ctx;
}

/** True for dispatch staff and administrators — false for guest viewers */
export function useCanMutate(): boolean {
  const { user } = useAppUser();
  return user ? canMutate(user.role) : false;
}
