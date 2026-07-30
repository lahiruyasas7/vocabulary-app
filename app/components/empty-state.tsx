import Link from "next/link";

interface EmptyStateProps {
  hasFilters: boolean;
}

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-4xl mb-4">{hasFilters ? "🔍" : "📖"}</div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">
        {hasFilters ? "No words match your filters" : "No words yet"}
      </h3>
      <p className="text-sm text-gray-400 mb-6">
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Start building your vocabulary by adding your first word."}
      </p>
      {!hasFilters && (
        <Link
          href="/words/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Add your first word
        </Link>
      )}
    </div>
  );
}
