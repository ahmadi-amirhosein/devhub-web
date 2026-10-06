"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthState = {
  token: string | null; role: string | null; ready: boolean;
  login: (token: string, role: string) => void; logout: () => void;
};
const Ctx = createContext<AuthState | null>(null);
const KEY = "devhub_auth";

// NOTE: localStorage is simple but readable by any injected script (XSS).
// For production, move the token into an httpOnly cookie set by the backend.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const v = JSON.parse(raw); setToken(v.token); setRole(v.role); }
    } catch {}
    setReady(true);
  }, []);

  const login = (t: string, r: string) => {
    setToken(t); setRole(r);
    localStorage.setItem(KEY, JSON.stringify({ token: t, role: r }));
  };
  const logout = () => { setToken(null); setRole(null); localStorage.removeItem(KEY); };

  return <Ctx.Provider value={{ token, role, ready, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
