import { notFound } from "next/navigation";
import { BASE, type Project } from "@/lib/api";
import ProposalForm from "@/components/ProposalForm";

export const dynamic = "force-dynamic";

async function load(id: string): Promise<Project | null> {
  const res = await fetch(`${BASE}/api/projects/${id}`, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return null;
  return res.json();
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const p = await load(id);
  return { title: p ? `${p.title} – DevHub` : "Project not found" };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const p = await load(id);
  if (!p) notFound();
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
