import { BASE, type Project } from "@/lib/api";
import ProjectCard from "@/components/ProjectCard";

export const dynamic = "force-dynamic";

async function load(category?: string): Promise<Project[] | null> {
  try {
    const q = category ? `?category=${encodeURIComponent(category)}` : "";
    const res = await fetch(`${BASE}/api/projects${q}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()).items ?? [];
  } catch {
    return null;
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const items = await load(category);
  return (
    <>
      <h1>Open projects</h1>
      {items === null && <p className="error">Could not reach the API. Is the Go server running?</p>}
      {items?.length === 0 && <p className="muted">No open projects yet.</p>}
      <div className="grid">{items?.map((p) => <ProjectCard key={p.id} p={p} />)}</div>
    </>
  );
}
