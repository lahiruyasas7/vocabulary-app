"use client";

import {
  createCategory,
  deleteCategory,
  renameCategory,
} from "@/lib/actions/categories";
import { useOptimistic, useTransition, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

interface Category {
  id: string;
  name: string;
  _count: { words: number };
}

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [optimisticCategories, applyOptimistic] = useOptimistic(
    categories,
    (
      state: Category[],
      action:
        | { type: "delete"; id: string }
        | { type: "add"; category: Category }
        | { type: "rename"; id: string; name: string },
    ) => {
      if (action.type === "delete") {
        return state.filter((c) => c.id !== action.id);
      }
      if (action.type === "add") {
        return [...state, action.category];
      }
      if (action.type === "rename") {
        return state.map((c) =>
          c.id === action.id ? { ...c, name: action.name } : c,
        );
      }
      return state;
    },
  );

  return (
    <div className="space-y-6">
      {/* Add form */}
      <AddCategoryForm applyOptimistic={applyOptimistic} />

      {/* List */}
      {optimisticCategories.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2">
          {optimisticCategories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              applyOptimistic={applyOptimistic}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Add form ───────────────────────────────────────────────
function AddCategoryForm({
  applyOptimistic,
}: {
  applyOptimistic: (action: {
    type: "add";
    category: { id: string; name: string; _count: { words: number } };
  }) => void;
}) {
  const [state, formAction] = useActionState(createCategory, undefined);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <h2 className="text-sm font-medium text-gray-900 mb-3">New category</h2>
      <form
        action={async (formData: FormData) => {
          const name = formData.get("name") as string;
          if (!name?.trim()) return;

          // Optimistic add with a temporary id
          applyOptimistic({
            type: "add",
            category: {
              id: `temp-${Date.now()}`,
              name: name.trim(),
              _count: { words: 0 },
            },
          });

          await formAction(formData);
        }}
        className="flex gap-2"
      >
        <input
          name="name"
          type="text"
          placeholder="e.g. novels, tech, movies & tv"
          className={[
            "flex-1 px-3 py-2 text-sm border rounded-lg bg-white",
            "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
            "placeholder:text-gray-300",
            state?.errors?.name ? "border-red-300" : "border-gray-200",
          ].join(" ")}
        />
        <AddButton />
      </form>
      {state?.errors?.name && (
        <p className="mt-2 text-xs text-red-600">{state.errors.name[0]}</p>
      )}
    </div>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
    >
      {pending ? "Adding..." : "Add"}
    </button>
  );
}

// ── Category row ───────────────────────────────────────────
function CategoryRow({
  category,
  applyOptimistic,
}: {
  category: Category;
  applyOptimistic: (
    action:
      | { type: "delete"; id: string }
      | { type: "add"; category: Category }
      | { type: "rename"; id: string; name: string },
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Rename action bound with category id
  const renameWithId = renameCategory.bind(null, category.id);
  const [renameState, renameAction] = useActionState(renameWithId, undefined);

  function handleDelete() {
    if (
      !confirm(
        category._count.words > 0
          ? `Delete "${category.name}"? It's used by ${category._count.words} ${
              category._count.words === 1 ? "word" : "words"
            }. The words themselves won't be deleted.`
          : `Delete "${category.name}"?`,
      )
    )
      return;

    setDeleteError(null);

    startTransition(async () => {
      try {
        applyOptimistic({ type: "delete", id: category.id });
        await deleteCategory(category.id);
      } catch {
        // useOptimistic auto-rolls back on throw
        setDeleteError("Failed to delete. Please try again.");
      }
    });
  }

  function handleRenameSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    if (name?.trim() && name.trim() !== category.name) {
      applyOptimistic({ type: "rename", id: category.id, name: name.trim() });
    }
    setIsEditing(false);
  }

  const isTemp = category.id.startsWith("temp-");

  return (
    <li
      className={`bg-white border border-gray-100 rounded-xl px-4 py-3 transition-opacity ${
        isPending || isTemp ? "opacity-50" : ""
      }`}
    >
      {isEditing ? (
        // ── Rename form ──────────────────────────────────
        <form
          action={async (formData: FormData) => {
            handleRenameSubmit(formData);
            await renameAction(formData);
          }}
          className="flex gap-2 items-start"
        >
          <div className="flex-1 space-y-1">
            <input
              name="name"
              type="text"
              defaultValue={category.name}
              autoFocus
              className={[
                "w-full px-3 py-1.5 text-sm border rounded-lg",
                "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
                renameState?.errors?.name
                  ? "border-red-300"
                  : "border-gray-200",
              ].join(" ")}
            />
            {renameState?.errors?.name && (
              <p className="text-xs text-red-600">
                {renameState.errors.name[0]}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            <RenameSubmitButton />
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // ── Display row ──────────────────────────────────
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">
              {category.name}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {isTemp
                ? "saving..."
                : `${category._count.words} ${
                    category._count.words === 1 ? "word" : "words"
                  }`}
            </span>
          </div>

          {!isTemp && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Rename */}
              <button
                onClick={() => setIsEditing(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                title="Rename"
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
              </button>

              {/* Delete */}
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
          )}
        </div>
      )}

      {/* Delete error (auto-rollback happened) */}
      {deleteError && (
        <p className="mt-2 text-xs text-red-600">{deleteError}</p>
      )}
    </li>
  );
}

function RenameSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-3 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
    >
      {pending ? "Saving..." : "Save"}
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-3xl mb-3">🗂️</div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        No categories yet
      </h3>
      <p className="text-sm text-gray-400">
        Create categories like &ldquo;novels&rdquo;, &ldquo;tech&rdquo;, or
        &ldquo;movies &amp; tv&rdquo; to organize your words.
      </p>
    </div>
  );
}
