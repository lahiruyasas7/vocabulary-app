import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "./header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}