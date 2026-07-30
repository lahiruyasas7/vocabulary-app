"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginUser } from "@/lib/actions/auth";

function LoginForm() {
  const [state, action] = useActionState(loginUser, undefined);
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to your vocabulary
          </p>
        </div>

        {registered && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">
              Account created. You can sign in now.
            </p>
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          {state?.message && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <SubmitButton label="Sign in" loadingLabel="Signing in..." />
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          No account?{" "}
          <Link
            href="/register"
            className="text-gray-900 underline underline-offset-2"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

// ── Shared submit button ───────────────────────────────────
function SubmitButton({
  label,
  loadingLabel,
}: {
  label: string;
  loadingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {pending ? loadingLabel : label}
    </button>
  );
}
