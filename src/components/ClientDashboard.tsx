"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { api, errMsg, type DevMatch, type Project, type ProposalWithDev } from "@/lib/api";

const emptyForm = { title: "", description: "", budget_min: 0, budget_max: 0 };

export default function ClientDashboard({ token }: { token: string }) {
  const [items, setItems] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [proposals, setProposals] = useState<Record<string, ProposalWithDev[]>>({});
  const [matches, setMatches] = useState<Record<string, DevMatch[]>>({});

  const load = useCallback(async () => {
    try {
      const d = await api<{ items: Project[] }>("/api/me/projects", { token });
      setItems(d.items ?? []);
    } catch (e) { setError(errMsg(e)); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function loadProposals(id: string) {
    const d = await api<{ items: ProposalWithDev[] }>(`/api/projects/${id}/proposals`, { token });
    setProposals((p) => ({ ...p, [id]: d.items ?? [] }));
  }

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id); setError("");
    try { await fn(); await load(); } catch (e) { setError(errMsg(e)); } finally { setBusy(null); }
  }

  async function loadMatches(id: string) {
    const d = await api<{ items: DevMatch[] }>(`/api/projects/${id}/matches`, { token });
    setMatches((m) => ({ ...m, [id]: d.items ?? [] }));
  }

  function toggleMatches(id: string) {
    if (matches[id]) setMatches(({ [id]: _removed, ...rest }) => rest);
    else run(id, () => loadMatches(id));
  }

  function toggleProposals(id: string) {
    if (proposals[id]) setProposals(({ [id]: _removed, ...rest }) => rest);
    else run(id, () => loadProposals(id));
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    await run("create", async () => {
      await api("/api/projects", { token, body: form });
      setForm(emptyForm);
    });
  }

  return (
    <>
      <h1>My projects</h1>
      {error && <p className="error">{error}</p>}

      <form className="card" onSubmit={create}>
        <h3>New project</h3>
        <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} /></label>
        <label>Description<textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={30} /></label>
        <div className="row">
          <label>Budget min<input type="number" min={0} value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: +e.target.value })} /></label>
          <label>Budget max<input type="number" min={0} value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: +e.target.value })} /></label>
        </div>
        <button disabled={busy === "create"}>Create draft</button>
      </form>

      {items.map((p) => (
        <article key={p.id} className="card">
          <h3>{p.title} <span className={`badge ${p.status}`}>{p.status}</span></h3>
          <p className="muted">{p.category || "uncategorized"} · {p.budget_min}–{p.budget_max}</p>
          {p.spec && (
            <div>
              <p>{p.spec.summary}</p>
              <ul>{p.spec.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
          )}
          <div className="row">
            <button disabled={busy === p.id} onClick={() => run(p.id, () => api(`/api/projects/${p.id}/analyze`, { method: "POST", token }))}>
              {busy === p.id ? "Working…" : p.spec ? "Re-analyze with AI" : "Analyze with AI"}
            </button>
            {p.status === "draft" && (
              <button disabled={busy === p.id} onClick={() => run(p.id, () => api(`/api/projects/${p.id}/publish`, { method: "POST", token }))}>Publish</button>
            )}
            {p.status !== "draft" && (
              <>
                <button className="link" onClick={() => toggleProposals(p.id)}>
                  {proposals[p.id] ? "Hide proposals" : "Show proposals"}
                </button>
                {p.status === "open" && (
                  <button className="link" onClick={() => toggleMatches(p.id)}>
                    {matches[p.id] ? "Hide suggestions" : "Suggest developers"}
                  </button>
                )}
                <Link href={`/projects/${p.id}`}>Public page</Link>
              </>
            )}
          </div>

          {proposals[p.id] && (
            <div className="sub">
              {proposals[p.id].length === 0 && <p className="muted">No proposals yet.</p>}
              {proposals[p.id].map((pr) => (
                <div key={pr.id} className="sub">
                  <b>{pr.developer_headline}</b> <span className={`badge ${pr.status}`}>{pr.status}</span>
                  <div className="skills">{pr.developer_skills.map((s) => <span key={s}>{s}</span>)}</div>
                  <p className="muted">Offer: {pr.price} · rate {pr.developer_hourly_rate}/h</p>
                  <p style={{ whiteSpace: "pre-wrap" }}>{pr.message}</p>
                  {pr.status === "pending" && p.status === "open" && (
                    <button disabled={busy === p.id} onClick={() => run(p.id, async () => {
                      await api(`/api/proposals/${pr.id}/accept`, { method: "POST", token });
                      await loadProposals(p.id);
                    })}>Accept this proposal</button>
                  )}
                </div>
              ))}
            </div>
          )}
          {matches[p.id] && (
            <div className="sub">
              <b>Suggested developers</b>
              {matches[p.id].length === 0 && <p className="muted">No developer profiles to compare yet.</p>}
              {matches[p.id].map((m) => (
                <div key={m.developer_id} className="sub">
                  <b>{m.headline}</b> <span className="muted">· similarity {m.score.toFixed(2)} · {m.hourly_rate}/h</span>
                  {m.bio && <p className="muted">{m.bio}</p>}
                  <div className="skills">
                    {m.skills.map((s) => <span key={s} className={(m.matched_skills ?? []).includes(s) ? "hit" : ""}>{s}</span>)}
                  </div>
                  {(m.matched_skills ?? []).length > 0 && (
                    <p className="muted">Skills the project mentions: {m.matched_skills.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </article>
      ))}
    </>
  );
}
