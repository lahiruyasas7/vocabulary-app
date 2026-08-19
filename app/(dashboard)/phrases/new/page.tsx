import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PhraseForm } from "@/app/components/phrase-form";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { createPhrase } from "@/lib/actions/phrases";

export const metadata = {
  title: "Add phrase — My Vocabulary",
};

export default async function NewPhrasePage() {
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
          href="/phrases"
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
          Back to phrases
        </Link>
        <h1 className="text-xl font-medium text-gray-900">Add phrase</h1>
        <p className="text-sm text-gray-400 mt-1">
          Save a new phrase to your vocabulary.
        </p>
      </div>

      <PhraseForm
        action={createPhrase}
        categories={categories}
        submitLabel="Save phrase"
      />
    </div>
  );
}