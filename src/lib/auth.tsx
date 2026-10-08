"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type AuthState = {
  token: string | null; role: string | null; email: string | null; ready: boolean;
  login: (token: string, role: string, email: string) => void; logout: () => void;
};
const Ctx = createContext<AuthState | null>(null);
const KEY = "devhub_auth";

// NOTE: localStorage is simple but readable by any injected script (XSS).
// For production, move the token into an httpOnly cookie set by the backend.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const v = JSON.parse(raw); setToken(v.token); setRole(v.role); setEmail(v.email ?? null); }
    } catch {}
    setReady(true);
  }, []);

  const login = useCallback((t: string, r: string, e: string) => {
    setToken(t); setRole(r); setEmail(e);
    localStorage.setItem(KEY, JSON.stringify({ token: t, role: r, email: e }));
  }, []);
  const logout = useCallback(() => { setToken(null); setRole(null); setEmail(null); localStorage.removeItem(KEY); }, []);

  return <Ctx.Provider value={{ token, role, email, ready, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
