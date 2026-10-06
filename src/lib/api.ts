export const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type Spec = { summary: string; category: string; features: string[]; risks: string[] };
export type Project = {
  id: string; client_id: string; title: string; description: string; category: string;
  status: "draft" | "open" | "in_progress" | "done";
  budget_min: number; budget_max: number; spec?: Spec | null; created_at: string;
};

type Options = { method?: string; body?: unknown; token?: string | null };

export async function api<T>(path: string, { method, body, token }: Options = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `Request failed (${res.status})`);
  return data as T;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

export type Profile = { headline: string; bio: string; skills: string[]; hourly_rate: number };
export type Proposal = {
  id: string; project_id: string; developer_id: string; price: number; message: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn"; created_at: string;
};
export type ProposalWithDev = Proposal & {
  developer_headline: string; developer_skills: string[]; developer_hourly_rate: number;
};
export type ProposalWithProject = Proposal & { project_title: string };
