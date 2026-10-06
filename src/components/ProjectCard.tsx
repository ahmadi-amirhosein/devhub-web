import Link from "next/link";
import type { Project } from "@/lib/api";

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <article className="card">
      <h3><Link href={`/projects/${p.id}`}>{p.title}</Link></h3>
      <p className="muted">
        {p.category || "uncategorized"} · {p.budget_min}–{p.budget_max}
      </p>
      <p>{p.description.length > 180 ? p.description.slice(0, 180) + "…" : p.description}</p>
    </article>
  );
}
