"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useDebounce } from "../hooks/use-debounce";
import { PhraseType, Register } from "@/app/generated/prisma/enums";

const PHRASE_TYPES = [
  { label: "All types", value: "" },
  { label: "Idiom", value: "IDIOM" },
  { label: "Phrasal verb", value: "PHRASAL_VERB" },
  { label: "Collocation", value: "COLLOCATION" },
  { label: "Proverb", value: "PROVERB" },
  { label: "Expression", value: "EXPRESSION" },
  { label: "Clause", value: "CLAUSE" },
];

const REGISTERS = [
  { label: "All registers", value: "" },
  { label: "Formal", value: "FORMAL" },
  { label: "Informal", value: "INFORMAL" },
  { label: "Slang", value: "SLANG" },
  { label: "Neutral", value: "NEUTRAL" },
];

const SORT_OPTIONS = [
  { label: "Date added", value: "date" },
  { label: "A → Z", value: "asc" },
  { label: "Z → A", value: "desc" },
];

interface PhraseFiltersProps {
  categories: { id: string; name: string }[];
  totalCount: number;
}

export function PhraseFilters({
  categories,
  totalCount,
}: PhraseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") ?? "date";
  const currentType = searchParams.get("type") ?? "";
  const currentRegister = searchParams.get("register") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(currentSearch);
  const debouncedSearch = useDebounce(search, 300);

  // Keep the input synced with the URL.
  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      // Reset pagination when filters change.
      params.delete("page");

      const nextUrl = `${pathname}?${params.toString()}`;
      const currentUrl = `${pathname}?${searchParams.toString()}`;

      // Avoid unnecessary navigations.
      if (nextUrl === currentUrl) {
        return;
      }

      startTransition(() => {
        router.push(nextUrl);
      });
    },
    [pathname, router, searchParams]
  );

  // Update the URL only after the user stops typing.
  useEffect(() => {
    if (debouncedSearch === currentSearch) {
      return;
    }

    updateParam("q", debouncedSearch);
  }, [debouncedSearch, currentSearch, updateParam]);

  return (
    <div
      className={`space-y-3 ${
        isPending ? "opacity-60 pointer-events-none" : ""
      } transition-opacity`}
    >
      {/* Search + Sort */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            placeholder="Search phrases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          />
        </div>

        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 min-w-[130px]"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Phrase type filter */}
      <div className="flex gap-1.5 flex-wrap">
        {PHRASE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => updateParam("type", type.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentType === type.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Register filter */}
      <div className="flex gap-1.5 flex-wrap">
        {REGISTERS.map((reg) => (
          <button
            key={reg.value}
            onClick={() => updateParam("register", reg.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentRegister === reg.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {reg.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => updateParam("category", "")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentCategory === ""
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            All categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam("category", cat.name)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                currentCategory === cat.name
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="text-xs text-gray-400">
        {totalCount} {totalCount === 1 ? "phrase" : "phrases"}
        {isPending && " · updating..."}
      </p>
    </div>
  );
}