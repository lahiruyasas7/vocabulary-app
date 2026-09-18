"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/lib/actions/auth";

interface HeaderProps {
  session: {
    user: {
      name?: string | null;
      email?: string | null;
    };
  };
}

export function Header({ session }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-medium text-gray-900 text-sm tracking-tight">
            vocab
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="/words"
              className={`
                text-sm
                ${pathname.startsWith("/words") ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
                transition-colors
              `}
            >
              Words
            </Link>

            <Link
              href="/categories"
              className={`
                text-sm
                ${pathname.startsWith("/categories") ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
                transition-colors
              `}
            >
              Categories
            </Link>
            <Link
              href="/phrases"
              className={`
                text-sm
                ${pathname.startsWith("/phrases") ? "text-gray-900 font-medium" : "text-gray-600 hover:text-gray-900"}
                transition-colors
              `}
            >
              Phrases
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            {session.user.name ?? session.user.email ?? 'User'}
          </span>
          <form action={logoutUser}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}