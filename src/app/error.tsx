'use client'

import Link from 'next/link'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="max-w-md mx-auto px-4 text-center">
        <p className="text-6xl font-bold text-app-violet mb-4">500</p>
        <h1 className="text-2xl font-bold text-app-text mb-4">
          Something went wrong
        </h1>
        <p className="text-app-textMuted mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-app-softBlue text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-app-surfaceElevated border border-app-border text-app-text font-semibold hover:bg-app-surface transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
