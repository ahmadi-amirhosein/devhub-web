"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError, errMsg, type Project } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ProjectCard from "@/components/ProjectCard";

export default function Home() {
  const { token, ready, logout } = useAuth();
  const [items, setItems] = useState<Project[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready || !token) return;
    const category = new URLSearchParams(window.location.search).get("category");
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    api<{ items: Project[] }>(`/api/projects${q}`, { token })
      .then((d) => setItems(d.items ?? []))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) logout(); // expired token
        else setError(errMsg(e));
      });
  }, [ready, token, logout]);

  if (!ready) return <p className="muted">Loading…</p>;

  if (!token) {
    return (
      <section className="card narrow">
        <h1>DevHub</h1>
        <p>Describe your programming project, get an AI-structured spec, and find the right developer.</p>
        <p className="muted">Projects are visible to members only.</p>
        <Link href="/login">Log in or create an account</Link>
      </section>
    );
  }

  return (
    <>
      <h1>Open projects</h1>
      {error && <p className="error">{error}</p>}
      {items?.length === 0 && <p className="muted">No open projects yet.</p>}
      <div className="grid">{items?.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
    </>
  );
}
