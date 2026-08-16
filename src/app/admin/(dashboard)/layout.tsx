import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/admin-nav";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { isAuthenticated } from "@/lib/auth";
import { isTelegramConfigured } from "@/lib/telegram";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  return (
    <Container className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ink-900">Admin</h1>
          <p className="text-sm text-ink-500">
            Work every lead the day it lands.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      {!isTelegramConfigured() ? (
        <p className="mb-6 rounded-card border border-brass-400/50 bg-brass-200/30 px-4 py-3 text-sm text-brass-800">
          Telegram notifications are off — set <code>TELEGRAM_BOT_TOKEN</code>{" "}
          and <code>TELEGRAM_CHAT_ID</code>. Until then leads only appear here,
          so check this page daily.{" "}
          <Link href="/admin/leads" className="underline">
            View leads
          </Link>
        </p>
      ) : null}

      <AdminNav />

      <div className="mt-8">{children}</div>
    </Container>
  );
}
