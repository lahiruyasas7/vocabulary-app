import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CategoriesClient } from "@/app/components/categories-client";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Categories — My Vocabulary",
};

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      _count: { select: { words: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900">Categories</h1>
        <p className="text-sm text-gray-400 mt-1">
          Organise your words by where you found them.
        </p>
      </div>

      <CategoriesClient categories={categories} />
    </div>
  );
}
