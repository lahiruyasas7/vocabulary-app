// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-24 text-center sm:py-32 lg:px-8">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
      </div>

      <div className="max-w-md">
        {/* Status Code Visual */}
        <p className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
          Error 404
        </p>

        {/* Headline */}
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Page Not Found
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base leading-7 text-gray-600">
          Sorry, we couldn’t find the page you’re looking for. It might have
          been moved, deleted, or never existed.
        </p>

        {/* Interactive CTA Button */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/words"
            className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all duration-200"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
