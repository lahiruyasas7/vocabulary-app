import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { WordCard } from "@/app/components/word-card";
import { WordFilters } from "@/app/components/word-filters";
import { EmptyState } from "@/app/components/empty-state";
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

  // Validate partOfSpeech enum value
  const validPos = Object.values(PartOfSpeech).includes(pos as PartOfSpeech)
    ? (pos as PartOfSpeech)
    : undefined;

  // Build Prisma where clause
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

  // Build orderBy
  const orderBy =
    sort === "asc"
      ? { text: "asc" as const }
      : sort === "desc"
        ? { text: "desc" as const }
        : { createdAt: "desc" as const }; // default: newest first

  // Fetch words + categories in parallel
  const [words, categories, totalCount] = await Promise.all([
    prisma.word.findMany({
      where,
      orderBy,
      include: {
        categories: {
          select: { id: true, name: true },
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
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">My words</h1>
        </div>
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

      {/* Filters — client component wrapped in Suspense for searchParams */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
      >
        <WordFilters categories={categories} totalCount={totalCount} />
      </Suspense>

      {/* Word list */}
      {words.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <div className="space-y-2">
          {words.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
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
              className="h-24 bg-white border border-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      }
    >
      <WordsContent {...props} />
    </Suspense>
  );
}
