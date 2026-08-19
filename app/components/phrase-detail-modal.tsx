"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePhrase } from "@/lib/actions/phrases";
import {
  PHRASE_TYPE_LABELS,
  PHRASE_TYPE_STYLES,
  REGISTER_LABELS,
  REGISTER_STYLES
} from "../types/phrases.type";
import { ConfirmDialog } from "./conform-dialog";

interface PhraseDetailModalProps {
  phrase: {
    id: string;
    text: string;
    meaning: string;
    sinhalaPhrase: string | null;
    partOfSpeech: string | null;
    phraseType: string | null;
    register: string | null;
    exampleSentences: { id: string; text: string; order: number }[];
    notes: string | null;
    createdAt: Date;
    categories: { id: string; name: string }[];
  } | null;
  onClose: () => void;
}

export function PhraseDetailModal({ phrase, onClose }: PhraseDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Open/close dialog based on phrase selection
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (phrase) {
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
  }, [phrase]);

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
    if (!phrase) return;
    setShowConfirm(true);
  }, [phrase]);

  const confirmDelete = useCallback(() => {
    if (!phrase) return;

    startTransition(async () => {
      await deletePhrase(phrase.id);
      setShowConfirm(false);
      dialogRef.current?.close();
      onClose();
      router.refresh();
    });
  }, [phrase, onClose, router]);

  const cancelDelete = useCallback(() => {
    setShowConfirm(false);
  }, []);

  if (!phrase) return null;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(phrase.createdAt));

  return (
    <>
      <dialog
        ref={dialogRef}
        className="sm:max-w-lg sm:mx-auto sm:my-8 m-4 sm:w-full rounded-2xl shadow-2xl md:max-w-240 w-full"
      >
        <div className="bg-white rounded-2xl max-h-[85dvh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {phrase.text}
              </h2>
              <div className="flex flex-wrap gap-2">
                {phrase.partOfSpeech && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                      // We don't have specific POS styles for phrases, so use a neutral style
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {phrase.partOfSpeech.toLowerCase()}
                  </span>
                )}
                {phrase.phraseType && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                      PHRASE_TYPE_STYLES[phrase.phraseType] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {PHRASE_TYPE_LABELS[phrase.phraseType] ?? phrase.phraseType.toLowerCase()}
                  </span>
                )}
                {phrase.register && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold tracking-wide uppercase shrink-0 ${
                      REGISTER_STYLES[phrase.register] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {REGISTER_LABELS[phrase.register] ?? phrase.register.toLowerCase()}
                  </span>
                )}
              </div>
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
              <p className="text-gray-800 leading-relaxed">{phrase.meaning}</p>
            </section>

            {/* Examples */}
            {phrase.exampleSentences.length > 0 && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Examples
                </h3>
                <div className="space-y-2">
                  {phrase.exampleSentences.map((s) => (
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
            {phrase.notes && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Notes
                </h3>
                <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {phrase.notes}
                </p>
              </section>
            )}

            {/* Categories */}
            {phrase.categories.length > 0 && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {phrase.categories.map((cat) => (
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

            {/* Sinhala Phrase */}
            {phrase.sinhalaPhrase && (
              <section>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Sinhala Phrase/Meaning
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  {phrase.sinhalaPhrase}
                </p>
              </section>
            )}

            {/* Meta */}
            <p className="text-xs text-gray-400 pt-1">
              Added on {formattedDate}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl shrink-0">
            <Link
              href={`/phrases/${phrase.id}/edit`}
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
              Delete
            </button>
          </div>
        </div>
      </dialog>
      <ConfirmDialog
        isOpen={showConfirm}
        title={`Delete "${phrase.text}"?`}
        description="This phrase and all its example sentences will be permanently removed. You cannot undo this action."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isPending}
      />
    </>
  );
}