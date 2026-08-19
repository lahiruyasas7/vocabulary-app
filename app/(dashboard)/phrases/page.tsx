import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PhraseFilters } from "@/app/components/phrase-filters";
import { EmptyState } from "@/app/components/empty-state";
import { PhraseList } from "@/app/components/phrase-list";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { PhraseType, Register } from "@/app/generated/prisma/enums";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    type?: string;
    register?: string;
    category?: string;
  }>;
}

async function PhrasesContent({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { q, sort, type, register, category } = await searchParams;
  const userId = session.user.id;

  const validType = Object.values(PhraseType).includes(type as PhraseType)
    ? (type as PhraseType)
    : undefined;

  const validRegister = Object.values(Register).includes(register as Register)
    ? (register as Register)
    : undefined;

  const where = {
    userId,
    ...(q && {
      OR: [
        { text: { contains: q, mode: "insensitive" as const } },
        { meaning: { contains: q, mode: "insensitive" as const } },
        { sinhalaPhrase: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(validType && { phraseType: validType }),
    ...(validRegister && { register: validRegister }),
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

  const [phrases, categories, totalCount] = await Promise.all([
    prisma.phrase.findMany({
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
    prisma.phrase.count({ where }),
  ]);

  const hasFilters = !!(q || type || register || category);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-900">My phrases</h1>
        <Link
          href="/phrases/new"
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
          Add phrase
        </Link>
      </div>

      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded-xl animate-pulse" />}
      >
        <PhraseFilters categories={categories} totalCount={totalCount} />
      </Suspense>

      {phrases.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <PhraseList phrases={phrases} />
      )}
    </div>
  );
}

export default function PhrasesPage(props: PageProps) {
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
      <PhrasesContent {...props} />
    </Suspense>
  );
}