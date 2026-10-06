import "./globals.css";
import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "DevHub – specialized programming work",
  description: "Describe your project, get an AI-structured spec, and find the right developer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavBar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
