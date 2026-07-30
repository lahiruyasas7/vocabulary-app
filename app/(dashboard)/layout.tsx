import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/lib/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-medium text-gray-900 text-sm tracking-tight">
              vocab
            </span>
            <nav className="flex items-center gap-4">
              <Link
                href="/words"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Words
              </Link>

              <Link
                href="/categories"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Categories
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {session.user.name ?? session.user.email}
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

      {/* Page content */}
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
