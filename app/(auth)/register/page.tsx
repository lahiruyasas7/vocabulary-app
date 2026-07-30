"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { registerUser } from "@/lib/actions/auth";

const initialState = { errors: {}, message: null };

export default function RegisterPage() {
  const [state, action] = useActionState(registerUser, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start building your vocabulary
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {state?.errors?.name && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.name[0]}
              </p>
            )}
          </div>

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
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.email[0]}
              </p>
            )}
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
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm text-gray-700 mb-1"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            {state?.errors?.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          <SubmitButton
            label="Create account"
            loadingLabel="Creating account..."
          />
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-gray-900 underline underline-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

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
