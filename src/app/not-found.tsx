import type { Metadata } from 'next'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Page Not Found – MemSurf',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-transparent">
      <Navigation />
      <section className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-6xl font-bold text-app-lavender mb-4">404</p>
          <h1 className="text-2xl font-bold text-app-text mb-4">
            Page Not Found
          </h1>
          <p className="text-app-textMuted mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-app-softBlue text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
