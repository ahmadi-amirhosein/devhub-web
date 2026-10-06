"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ClientDashboard from "@/components/ClientDashboard";
import DeveloperDashboard from "@/components/DeveloperDashboard";

export default function Dashboard() {
  const { token, role, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready || !token) return <p className="muted">Loading…</p>;
  return role === "client" ? <ClientDashboard token={token} /> : <DeveloperDashboard token={token} />;
}
