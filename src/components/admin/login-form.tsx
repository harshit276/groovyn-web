"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = { error: null };

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-card border border-paper-300 bg-paper-50 p-6"
    >
      {!configured ? (
        <p className="rounded-lg bg-brass-200/40 px-3 py-2 text-xs leading-relaxed text-brass-800">
          Admin isn&apos;t configured yet. Add <code>ADMIN_PASSWORD</code> and{" "}
          <code>ADMIN_SESSION_SECRET</code> to <code>.env</code>, then restart
          the server.
        </p>
      ) : null}

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-paper-400 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-terra-600">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
