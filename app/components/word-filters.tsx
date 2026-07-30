"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

const PARTS_OF_SPEECH = [
  { label: "All", value: "" },
  { label: "Noun", value: "NOUN" },
  { label: "Verb", value: "VERB" },
  { label: "Adjective", value: "ADJECTIVE" },
  { label: "Adverb", value: "ADVERB" },
  { label: "Pronoun", value: "PRONOUN" },
  { label: "Preposition", value: "PREPOSITION" },
  { label: "Conjunction", value: "CONJUNCTION" },
  { label: "Interjection", value: "INTERJECTION" },
];

const SORT_OPTIONS = [
  { label: "Date added", value: "date" },
  { label: "A → Z", value: "asc" },
  { label: "Z → A", value: "desc" },
];

interface WordFiltersProps {
  categories: { id: string; name: string }[];
  totalCount: number;
}

export function WordFilters({ categories, totalCount }: WordFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get("sort") ?? "date";
  const currentPos = searchParams.get("pos") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const currentSearch = searchParams.get("q") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 on filter change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, pathname, router]
  );

  return (
    <div className={`space-y-3 ${isPending ? "opacity-60 pointer-events-none" : ""} transition-opacity`}>
      {/* Search + Sort row */}
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
            placeholder="Search words..."
            defaultValue={currentSearch}
            onChange={(e) => updateParam("q", e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
          />
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 min-w-[130px]"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Part of speech filter */}
      <div className="flex gap-1.5 flex-wrap">
        {PARTS_OF_SPEECH.map((pos) => (
          <button
            key={pos.value}
            onClick={() => updateParam("pos", pos.value)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              currentPos === pos.value
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {pos.label}
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
        {totalCount} {totalCount === 1 ? "word" : "words"}
        {isPending && " · updating..."}
      </p>
    </div>
  );
}