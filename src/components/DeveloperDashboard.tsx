"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, ApiError, errMsg, type Profile, type ProjectMatch, type ProposalWithProject } from "@/lib/api";

export default function DeveloperDashboard({ token }: { token: string }) {
  const [form, setForm] = useState({ headline: "", bio: "", skills: "", hourly_rate: 0 });
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [proposals, setProposals] = useState<ProposalWithProject[]>([]);
  const [fits, setFits] = useState<ProjectMatch[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const pr = await api<Profile>("/api/me/profile", { token }).catch((e) => {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      });
      setHasProfile(pr !== null);
      if (pr) setForm({ headline: pr.headline, bio: pr.bio, skills: pr.skills.join(", "), hourly_rate: pr.hourly_rate });
      const d = await api<{ items: ProposalWithProject[] }>("/api/me/proposals", { token });
      setProposals(d.items ?? []);
      // Suggestions are optional: matching may be switched off or the profile may be new.
      const m = await api<{ items: ProjectMatch[] }>("/api/me/matches", { token }).catch(() => null);
      setFits(m?.items ?? []);
    } catch (e) { setError(errMsg(e)); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setSaved(false);
    try {
      await api("/api/me/profile", {
        method: "PUT", token,
        body: { headline: form.headline, bio: form.bio, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean), hourly_rate: form.hourly_rate },
      });
      setSaved(true); setHasProfile(true);
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  }

  async function withdraw(id: string) {
    setError("");
    try { await api(`/api/proposals/${id}/withdraw`, { method: "POST", token }); await load(); }
    catch (e) { setError(errMsg(e)); }
  }

  return (
    <>
      <h1>Developer dashboard</h1>
      {error && <p className="error">{error}</p>}
      {hasProfile === false && <p>Create your profile first: clients see it next to your proposals.</p>}

      <form className="card" onSubmit={save}>
        <h3>My profile</h3>
        <label>Headline<input value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required minLength={3} maxLength={100} placeholder="Senior Android & Flutter developer" /></label>
        <label>About<textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={2000} /></label>
        <label>Skills (comma separated)<input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} required placeholder="kotlin, flutter, go" /></label>
        <label>Hourly rate<input type="number" min={0} value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: +e.target.value })} /></label>
        <button disabled={busy}>Save profile</button> {saved && <span className="muted">Saved</span>}
      </form>

      {fits.length > 0 && (
        <>
          <h2>Projects that fit you</h2>
          {fits.map((m) => (
            <article key={m.id} className="card">
              <h3><Link href={`/projects/${m.id}`}>{m.title}</Link></h3>
              <p className="muted">{m.category || "uncategorized"} · {m.budget_min}–{m.budget_max} · similarity {m.score.toFixed(2)}</p>
            </article>
          ))}
        </>
      )}

      <h2>My proposals</h2>
      {proposals.length === 0 && <p className="muted">No proposals yet. <Link href="/">Browse open projects</Link> and send one from a project page.</p>}
      {proposals.map((p) => (
        <article key={p.id} className="card">
          <h3><Link href={`/projects/${p.project_id}`}>{p.project_title}</Link> <span className={`badge ${p.status}`}>{p.status}</span></h3>
          <p className="muted">Offer: {p.price}</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{p.message}</p>
          {p.status === "pending" && <button className="link" onClick={() => withdraw(p.id)}>Withdraw</button>}
        </article>
      ))}
    </>
  );
}
