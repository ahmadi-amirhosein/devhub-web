"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const body = mode === "login" ? { email, password } : { email, password, role };
      const r = await api<{ token: string; role: string }>(`/api/auth/${mode}`, { body });
      login(r.token, r.role, email.trim().toLowerCase());
      router.push("/dashboard");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>{mode === "login" ? "Log in" : "Create account"}</h1>
      <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
      {mode === "register" && (
        <label>I am a
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="client">client (I need work done)</option>
            <option value="developer">developer</option>
          </select>
        </label>
      )}
      {error && <p className="error">{error}</p>}
      <button disabled={busy}>{busy ? "…" : mode === "login" ? "Log in" : "Register"}</button>
      <button type="button" className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "No account? Register" : "Have an account? Log in"}
      </button>
    </form>
  );
}
