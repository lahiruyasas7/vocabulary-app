import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PhraseForm } from "@/app/components/phrase-form";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { updatePhrase } from "@/lib/actions/phrases";

export const metadata = {
  title: "Edit phrase — My Vocabulary",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPhrasePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Fetch phrase + verify ownership in one query
  const [phrase, categories] = await Promise.all([
    prisma.phrase.findFirst({
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
  if (!phrase) notFound();

  // Bind phrase ID into the action so the form doesn't need a hidden input
  const updatePhraseWithId = updatePhrase.bind(null, phrase.id);

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
        <h1 className="text-xl font-medium text-gray-900">
          Edit <span className="text-gray-400 font-normal">{phrase.text}</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Update the details for this phrase.
        </p>
      </div>

      <PhraseForm
        action={updatePhraseWithId}
        categories={categories}
        defaultValues={{
          text: phrase.text,
          meaning: phrase.meaning,
          sinhalaPhrase: phrase.sinhalaPhrase,
          partOfSpeech: phrase.partOfSpeech,
          phraseType: phrase.phraseType,
          register: phrase.register,
          exampleSentences: phrase.exampleSentences.map((s) => s.text),
          notes: phrase.notes,
          categoryIds: phrase.categories.map((c) => c.id),
        }}
        submitLabel="Update phrase"
      />
    </div>
  );
}