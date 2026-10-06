"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ProposalForm({ projectId, status }: { projectId: string; status: string }) {
  const { token, role, ready } = useAuth();
  const [price, setPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready || status !== "open") return null;
  if (!token) return <p className="muted"><Link href="/login">Log in</Link> as a developer to send a proposal.</p>;
  if (role !== "developer") return null;
  if (done) return <p>Proposal sent. Track it in your <Link href="/dashboard">dashboard</Link>.</p>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api(`/api/projects/${projectId}/proposals`, { token, body: { price, message } });
      setDone(true);
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h3>Send a proposal</h3>
      <label>Your price<input type="number" min={1} value={price || ""} onChange={(e) => setPrice(+e.target.value)} required /></label>
      <label>Message<textarea rows={5} minLength={20} maxLength={2000} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Why you are a good fit, timeline, similar work…" /></label>
      {error && <p className="error">{error} {error.includes("profile") && <Link href="/dashboard">Create profile</Link>}</p>}
      <button disabled={busy}>{busy ? "Sending…" : "Send proposal"}</button>
    </form>
  );
}
