export default function CategoriesLoading() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <div className="h-7 w-32 bg-gray-100 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-56 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-16 bg-white border border-gray-100 rounded-xl animate-pulse" />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 bg-white border border-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}