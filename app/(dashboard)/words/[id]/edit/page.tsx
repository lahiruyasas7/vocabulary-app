import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { WordForm } from "@/app/components/word-form";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { updateWord } from "@/lib/actions/words";

export const metadata = {
  title: "Edit word — My Vocabulary",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWordPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Fetch word + verify ownership in one query
  const [word, categories] = await Promise.all([
    prisma.word.findFirst({
      where: { id, userId: session.user.id },
      include: {
        categories: { select: { id: true, name: true } },
        exampleSentences: {
          select: { id: true, text: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // 404 if not found or doesn't belong to user
  if (!word) notFound();

  // Bind word ID into the action so the form doesn't need a hidden input
  const updateWordWithId = updateWord.bind(null, word.id);

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
        <h1 className="text-xl font-medium text-gray-900">
          Edit <span className="text-gray-400 font-normal">{word.text}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Update the details for this word.
        </p>
      </div>

      <WordForm
        action={updateWordWithId}
        categories={categories}
        defaultValues={{
          text: word.text,
          meaning: word.meaning,
          partOfSpeech: word.partOfSpeech,
          exampleSentences: word.exampleSentences.map((s) => s.text),
          notes: word.notes,
          categoryIds: word.categories.map((c) => c.id),
        }}
        submitLabel="Update word"
      />
    </div>
  );
}
