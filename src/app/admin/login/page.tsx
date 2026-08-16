import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { Container } from "@/components/ui/container";
import { isAdminConfigured, isAuthenticated } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/admin");

  return (
    <Container className="py-20">
      <div className="mx-auto max-w-sm">
        <h1 className="text-2xl text-ink-900">Groovyn admin</h1>
        <p className="mt-2 text-sm text-ink-500">
          Leads, claims and suggestions.
        </p>

        <div className="mt-6">
          <LoginForm configured={isAdminConfigured()} />
        </div>
      </div>
    </Container>
  );
}
