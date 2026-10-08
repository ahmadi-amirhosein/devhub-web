"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function NavBar() {
  const { token, role, email, logout, ready } = useAuth();
  const router = useRouter();
  return (
    <header className="nav">
      <Link href="/" className="brand">DevHub</Link>
      <nav>
        {ready && token ? (
          <>
            <span className="who" title={email ?? ""}>
              {email && <span className="email">{email}</span>}
              <span className="badge">{role}</span>
            </span>
            <Link href="/dashboard">Dashboard</Link>
            <button className="link" onClick={() => { logout(); router.push("/"); }}>Log out</button>
          </>
        ) : (
          <Link href="/login">Log in</Link>
        )}
      </nav>
    </header>
  );
}
