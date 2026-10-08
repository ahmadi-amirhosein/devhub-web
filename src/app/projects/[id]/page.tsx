"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError, errMsg, type Project } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ProposalForm from "@/components/ProposalForm";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { token, ready, logout } = useAuth();
  const [p, setP] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    api<Project>(`/api/projects/${id}`, { token })
      .then(setP)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) logout();
        else setError(e instanceof ApiError && e.status === 404 ? "Project not found." : errMsg(e));
      });
  }, [ready, token, id, logout]);

  if (!ready) return <p className="muted">Loading…</p>;
  if (!token) return <p><Link href="/login">Log in</Link> to view this project.</p>;
  if (error) return <p className="error">{error}</p>;
  if (!p) return <p className="muted">Loading…</p>;

  return (
    <article>
      <h1>{p.title}</h1>
      <p className="muted">{p.category || "uncategorized"} · budget {p.budget_min}–{p.budget_max}</p>
      <p style={{ whiteSpace: "pre-wrap" }}>{p.description}</p>
      {p.spec && (
        <section className="card">
          <h3>AI-structured spec</h3>
          <p>{p.spec.summary}</p>
          <b>Features</b><ul>{p.spec.features.map((f, i) => <li key={i}>{f}</li>)}</ul>
          <b>Risks</b><ul>{p.spec.risks.map((f, i) => <li key={i}>{f}</li>)}</ul>
        </section>
      )}
      <ProposalForm projectId={p.id} status={p.status} />
    </article>
  );
}
