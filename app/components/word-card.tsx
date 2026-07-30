"use client";

import { deleteWord } from "@/lib/actions/words";
import Link from "next/link";
import { useTransition } from "react";

const POS_STYLES: Record<string, string> = {
  NOUN: "bg-blue-50 text-blue-700",
  VERB: "bg-green-50 text-green-700",
  ADJECTIVE: "bg-purple-50 text-purple-700",
  ADVERB: "bg-orange-50 text-orange-700",
  PRONOUN: "bg-pink-50 text-pink-700",
  PREPOSITION: "bg-yellow-50 text-yellow-700",
  CONJUNCTION: "bg-red-50 text-red-700",
  INTERJECTION: "bg-teal-50 text-teal-700",
};

const POS_LABELS: Record<string, string> = {
  NOUN: "noun",
  VERB: "verb",
  ADJECTIVE: "adj",
  ADVERB: "adv",
  PRONOUN: "pron",
  PREPOSITION: "prep",
  CONJUNCTION: "conj",
  INTERJECTION: "interj",
};

interface WordCardProps {
  word: {
    id: string;
    text: string;
    meaning: string;
    partOfSpeech: string;
    exampleSentence: string | null;
    notes: string | null;
    createdAt: Date;
    categories: { id: string; name: string }[];
  };
}

export function WordCard({ word }: WordCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${word.text}"?`)) return;
    startTransition(async () => {
      await deleteWord(word.id);
    });
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(word.createdAt));

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-4 flex gap-3 transition-opacity ${
        isPending ? "opacity-40" : ""
      }`}
    >
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-gray-900">{word.text}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              POS_STYLES[word.partOfSpeech] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {POS_LABELS[word.partOfSpeech] ?? word.partOfSpeech.toLowerCase()}
          </span>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed mb-2">
          {word.meaning}
        </p>

        {word.exampleSentence && (
          <p className="text-xs text-gray-400 italic mb-2 leading-relaxed">
            &ldquo;{word.exampleSentence}&rdquo;
          </p>
        )}

        {word.notes && (
          <p className="text-xs text-gray-400 mb-2">{word.notes}</p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-2 flex-wrap">
          {word.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
            >
              {cat.name}
            </span>
          ))}
          <span className="text-xs text-gray-300">{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <Link
          href={`/words/${word.id}/edit`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          title="Edit"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Link>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30"
          title="Delete"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
