"use client";

import { POS_LABELS, POS_STYLES } from "../types/words.type";

interface WordCardProps {
  word: {
    id: string;
    text: string;
    partOfSpeech: string;
    createdAt: Date;
  };
  onClick: () => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(word.createdAt));

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white border border-gray-100 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 hover:border-gray-200 hover:shadow-sm active:scale-[0.995] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-semibold text-gray-900 truncate">
          {word.text}
        </span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
            POS_STYLES[word.partOfSpeech] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {POS_LABELS[word.partOfSpeech] ?? word.partOfSpeech.toLowerCase()}
        </span>
      </div>

      <span className="text-xs text-gray-400 shrink-0 tabular-nums">
        {formattedDate}
      </span>
    </button>
  );
}
