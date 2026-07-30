"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const PARTS_OF_SPEECH = [
  { label: "Noun", value: "NOUN" },
  { label: "Verb", value: "VERB" },
  { label: "Adjective", value: "ADJECTIVE" },
  { label: "Adverb", value: "ADVERB" },
  { label: "Pronoun", value: "PRONOUN" },
  { label: "Preposition", value: "PREPOSITION" },
  { label: "Conjunction", value: "CONJUNCTION" },
  { label: "Interjection", value: "INTERJECTION" },
];

// Matches what createWord / updateWord server actions return
interface FormState {
  errors?: {
    text?: string[];
    meaning?: string[];
    partOfSpeech?: string[];
    exampleSentence?: string[];
    notes?: string[];
    categoryIds?: string[];
  };
  message?: string;
}

interface WordFormProps {
  action: (state: unknown, formData: FormData) => Promise<FormState>;
  categories: { id: string; name: string }[];
  defaultValues?: {
    text?: string;
    meaning?: string;
    partOfSpeech?: string;
    exampleSentence?: string | null;
    notes?: string | null;
    categoryIds?: string[];
  };
  submitLabel: string;
}

export function WordForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: WordFormProps) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {/* Global error */}
      {state?.message && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-sm text-red-600">{state.message}</p>
        </div>
      )}

      {/* Word */}
      <Field label="Word" required error={state?.errors?.text?.[0]}>
        <input
          name="text"
          type="text"
          required
          defaultValue={defaultValues?.text}
          placeholder="e.g. ephemeral"
          className={inputClass(!!state?.errors?.text)}
        />
      </Field>

      {/* Meaning */}
      <Field label="Meaning" required error={state?.errors?.meaning?.[0]}>
        <textarea
          name="meaning"
          required
          rows={3}
          defaultValue={defaultValues?.meaning}
          placeholder="What does it mean?"
          className={inputClass(!!state?.errors?.meaning)}
        />
      </Field>

      {/* Part of speech */}
      <Field
        label="Part of speech"
        required
        error={state?.errors?.partOfSpeech?.[0]}
      >
        <select
          name="partOfSpeech"
          required
          defaultValue={defaultValues?.partOfSpeech ?? ""}
          className={inputClass(!!state?.errors?.partOfSpeech)}
        >
          <option value="" disabled>
            Select...
          </option>
          {PARTS_OF_SPEECH.map((pos) => (
            <option key={pos.value} value={pos.value}>
              {pos.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Categories — multi-select as checkboxes */}
      {categories.length > 0 && (
        <Field
          label="Categories"
          hint="Select one or more (Where you found the word)"
          error={state?.errors?.categoryIds?.[0]}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const checked = defaultValues?.categoryIds?.includes(cat.id);
              return (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    name="categoryIds"
                    value={cat.id}
                    defaultChecked={checked}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {cat.name}
                  </span>
                </label>
              );
            })}
          </div>
        </Field>
      )}

      {categories.length === 0 && (
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-sm text-gray-500">
            No categories yet.{" "}
            <Link
              href="/categories"
              className="text-gray-900 underline underline-offset-2 hover:no-underline"
            >
              Create one first
            </Link>{" "}
            to tag this word.
          </p>
        </div>
      )}

      {/* Example sentence (optional) */}
      <Field
        label="Example sentence"
        hint="Optional"
        error={state?.errors?.exampleSentence?.[0]}
      >
        <textarea
          name="exampleSentence"
          rows={2}
          defaultValue={defaultValues?.exampleSentence ?? ""}
          placeholder="Use the word in a sentence..."
          className={inputClass(!!state?.errors?.exampleSentence)}
        />
      </Field>

      {/* Notes (optional) */}
      <Field label="Notes" hint="Optional" error={state?.errors?.notes?.[0]}>
        <textarea
          name="notes"
          rows={2}
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Any additional notes, synonyms, context..."
          className={inputClass(!!state?.errors?.notes)}
        />
      </Field>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Link
          href="/words"
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

// ── Sub-components ─────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-1.5">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-3 py-2 text-sm border rounded-lg bg-white",
    "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
    "placeholder:text-gray-300 transition-colors",
    hasError ? "border-red-300" : "border-gray-200",
  ].join(" ");
}
