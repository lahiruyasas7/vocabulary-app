import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WordForm } from "@/app/components/word-form";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createWord } from "@/lib/actions/words";

export const metadata = {
  title: "Add word — My Vocabulary",
};

export default async function NewWordPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/words"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-4"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to words
        </Link>
        <h1 className="text-xl font-medium text-gray-900">Add word</h1>
        <p className="text-sm text-gray-400 mt-1">
          Save a new word to your vocabulary.
        </p>
      </div>

      <WordForm
        action={createWord}
        categories={categories}
        submitLabel="Save word"
      />
    </div>
  );
}
