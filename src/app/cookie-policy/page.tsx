import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navigation />
      <section className="flex-1 pt-24 pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Cookie Policy
          </h1>
          <p className="text-gray-700">
            This page describes how Memsurf uses cookies and similar technologies.
            The current copy is placeholder text and should be replaced with your own policy.
          </p>
          <p className="text-gray-700">
            Make sure to include details on what cookies you use, why you use them, and
            how users can manage their preferences.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

