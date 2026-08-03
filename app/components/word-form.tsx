"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
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

interface FormState {
  errors?: {
    text?: string[];
    meaning?: string[];
    sinhalaWord?: string[];
    partOfSpeech?: string[];
    exampleSentences?: string[];
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
    sinhalaWord?: string | null;
    partOfSpeech?: string;
    exampleSentences?: string[];
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

  // Controlled state for dynamic sentence inputs
  const [sentences, setSentences] = useState<string[]>(
    defaultValues?.exampleSentences?.length
      ? defaultValues.exampleSentences
      : [""], // start with one empty input
  );

  function addSentence() {
    if (sentences.length >= 10) return;
    setSentences((prev) => [...prev, ""]);
  }

  function removeSentence(index: number) {
    setSentences((prev) => prev.filter((_, i) => i !== index));
  }

  function updateSentence(index: number, value: string) {
    setSentences((prev) => prev.map((s, i) => (i === index ? value : s)));
  }

  return (
    <form action={formAction} className="space-y-5">
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

      {/* Sinahala Word */}
      <Field
        label="Sinhala Word/ Meaning"
        hint="Optional"
        error={state?.errors?.sinhalaWord?.[0]}
      >
        <textarea
          name="sinhalaWord"
          required
          rows={3}
          defaultValue={defaultValues?.sinhalaWord ?? ""}
          placeholder="What does it Sinhala mean?"
          className={inputClass(!!state?.errors?.sinhalaWord)}
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

      {/* Example sentences */}
      <Field
        label="Example sentences"
        hint="Optional · max 10"
        error={state?.errors?.exampleSentences?.[0]}
      >
        <div className="space-y-2">
          {sentences.map((sentence, index) => (
            <div key={index} className="flex gap-2 items-start">
              <textarea
                name="exampleSentences"
                value={sentence}
                onChange={(e) => updateSentence(index, e.target.value)}
                rows={2}
                placeholder={`Sentence ${index + 1}...`}
                className={inputClass(false)}
              />
              {sentences.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSentence(index)}
                  className="mt-1 w-8 h-8 flex items-center justify-center flex-shrink-0 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove sentence"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {sentences.length < 10 && (
            <button
              type="button"
              onClick={addSentence}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mt-1"
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
              Add another sentence
            </button>
          )}
        </div>
      </Field>

      {/* Categories */}
      {categories.length > 0 && (
        <Field
          label="Categories"
          hint="Select one or more"
          error={state?.errors?.categoryIds?.[0]}
        >
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={cat.id}
                  defaultChecked={defaultValues?.categoryIds?.includes(cat.id)}
                  className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
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

      {/* Notes */}
      <Field label="Notes" hint="Optional" error={state?.errors?.notes?.[0]}>
        <textarea
          name="notes"
          rows={2}
          defaultValue={defaultValues?.notes ?? ""}
          placeholder="Synonyms, context, memory hooks..."
          className={inputClass(!!state?.errors?.notes)}
        />
      </Field>

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
