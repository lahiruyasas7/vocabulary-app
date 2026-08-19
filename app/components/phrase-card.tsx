"use client";

import {
  PHRASE_TYPE_LABELS,
  PHRASE_TYPE_STYLES,
  REGISTER_LABELS,
  REGISTER_STYLES,
} from "../types/phrases.type";

interface PhraseCardProps {
  phrase: {
    id: string;
    text: string;
    phraseType: string | null;
    register: string | null;
    createdAt: Date;
  };
  onClick: () => void;
}

export function PhraseCard({ phrase, onClick }: PhraseCardProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(phrase.createdAt));

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white border border-gray-100 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4 hover:border-gray-200 hover:shadow-sm active:scale-[0.995] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-semibold text-gray-900 truncate">
          {phrase.text}
        </span>
        <div className="flex flex-wrap gap-2">
          {phrase.phraseType && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                PHRASE_TYPE_STYLES[phrase.phraseType] ??
                "bg-gray-100 text-gray-600"
              }`}
            >
              {PHRASE_TYPE_LABELS[phrase.phraseType] ??
                phrase.phraseType.toLowerCase()}
            </span>
          )}
          {phrase.register && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                REGISTER_STYLES[phrase.register] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {REGISTER_LABELS[phrase.register] ??
                phrase.register.toLowerCase()}
            </span>
          )}
        </div>
      </div>

      <span className="text-xs text-gray-400 shrink-0 tabular-nums">
        {formattedDate}
      </span>
    </button>
  );
}
