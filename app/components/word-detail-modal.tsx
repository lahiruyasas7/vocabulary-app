"use client";

import { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteWord } from "@/lib/actions/words";
import { POS_LABELS, POS_STYLES } from "../types/words.type";

interface WordDetailModalProps {
  word: {
    id: string;
    text: string;
    meaning: string;
    partOfSpeech: string;
    exampleSentences: { id: string; text: string; order: number }[];
    notes: string | null;
    createdAt: Date;
    categories: { id: string; name: string }[];
  } | null;
  onClose: () => void;
}

export function WordDetailModal({ word, onClose }: WordDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Open/close dialog based on word selection
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (word) {
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = "hidden";
      }
      // Focus the close button for accessibility
      const closeBtn = dialog.querySelector<HTMLButtonElement>("[data-close]");
      setTimeout(() => closeBtn?.focus(), 0);
    } else {
      if (dialog.open) {
        dialog.close();
        document.body.style.overflow = "";
      }
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [word]);

  // Handle backdrop click and native close event
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isBackdrop =
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom;
      if (isBackdrop) dialog.close();
    };

    const handleClose = () => onClose();

    dialog.addEventListener("click", handleClick);
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("click", handleClick);
      dialog.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (!word) return;
    if (!confirm(`Delete "${word.text}"? This cannot be undone.`)) return;

    startTransition(async () => {
      await deleteWord(word.id);
      onClose();
      router.refresh(); // <-- critical: updates the list without full reload
    });
  }, [word, onClose, router]);

  if (!word) return null;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(word.createdAt));

  return (
    <dialog
      ref={dialogRef}
      className="sm:max-w-lg sm:mx-auto sm:my-8 m-4 w-auto sm:w-full rounded-2xl shadow-2xl"
    >
      <div className="bg-white rounded-2xl max-h-[85dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {word.text}
            </h2>
            <span
              className={`text-[11px] px-2.5 py-1 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                POS_STYLES[word.partOfSpeech] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {POS_LABELS[word.partOfSpeech] ?? word.partOfSpeech.toLowerCase()}
            </span>
          </div>
          <button
            data-close
            onClick={() => dialogRef.current?.close()}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto">
          {/* Meaning */}
          <section>
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Meaning
            </h3>
            <p className="text-gray-800 leading-relaxed">{word.meaning}</p>
          </section>

          {/* Examples */}
          {word.exampleSentences.length > 0 && (
            <section>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Examples
              </h3>
              <div className="space-y-2">
                {word.exampleSentences.map((s) => (
                  <p
                    key={s.id}
                    className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3 leading-relaxed"
                  >
                    &ldquo;{s.text}&rdquo;
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          {word.notes && (
            <section>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Notes
              </h3>
              <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                {word.notes}
              </p>
            </section>
          )}

          {/* Categories */}
          {word.categories.length > 0 && (
            <section>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {word.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Meta */}
          <p className="text-xs text-gray-400 pt-1">Added on {formattedDate}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
          <Link
            href={`/words/${word.id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
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
            Edit
          </Link>

          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
