import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { WordFilters } from "@/app/components/word-filters";
import { EmptyState } from "@/app/components/empty-state";
import { WordList } from "@/app/components/word-list";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PartOfSpeech } from "@/app/generated/prisma/enums";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    pos?: string;
    category?: string;
  }>;
}

async function WordsContent({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, sort, pos, category } = await searchParams;
  const userId = session.user.id;

  const validPos = Object.values(PartOfSpeech).includes(pos as PartOfSpeech)
    ? (pos as PartOfSpeech)
    : undefined;

  const where = {
    userId,
    ...(q && {
      OR: [
        { text: { contains: q, mode: "insensitive" as const } },
        { meaning: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(validPos && { partOfSpeech: validPos }),
    ...(category && {
      categories: {
        some: { name: { equals: category, mode: "insensitive" as const } },
      },
    }),
  };

  const orderBy =
    sort === "asc"
      ? { text: "asc" as const }
      : sort === "desc"
        ? { text: "desc" as const }
        : { createdAt: "desc" as const };

  const [words, categories, totalCount] = await Promise.all([
    prisma.word.findMany({
      where,
      orderBy,
      include: {
        categories: { select: { id: true, name: true } },
        exampleSentences: {
          select: { id: true, text: true, order: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.word.count({ where }),
  ]);

  const hasFilters = !!(q || pos || category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">My words</h1>
        <Link
          href="/words/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add word
        </Link>
      </div>

      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
      >
        <WordFilters categories={categories} totalCount={totalCount} />
      </Suspense>

      {words.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <WordList words={words} />
      )}
    </div>
  );
}

export default function WordsPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-white border border-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      }
    >
      <WordsContent {...props} />
    </Suspense>
  );
}
