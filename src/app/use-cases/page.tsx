import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Testimonials from '@/components/Testimonials'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Use Cases – How People Use MemSurf for Learning',
  description: 'Discover how students, professionals, researchers, and lifelong learners use MemSurf to capture knowledge, create quizzes, and master material.',
  alternates: {
    canonical: 'https://memsurf.com/use-cases',
  },
  openGraph: {
    title: 'Use Cases – MemSurf',
    description: 'See how students, professionals, and lifelong learners use MemSurf.',
    url: 'https://memsurf.com/use-cases',
  },
}

export default function UseCasesPage() {
    const pageUrl = 'https://memsurf.com/use-cases'
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Use Cases – How People Use MemSurf for Learning',
      description: 'Discover how students, professionals, researchers, and lifelong learners use MemSurf.',
      url: pageUrl,
      isPartOf: { '@id': 'https://memsurf.com/#website' },
    }

    return (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
          <main className="min-h-screen bg-transparent">
            <Navigation />
            <div className="pt-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-app-text text-center">
                        How People Use MemSurf
                    </h1>
                    <p className="text-lg text-app-textMuted text-center mt-4 max-w-2xl mx-auto">
                        Students, professionals, researchers, and lifelong learners trust MemSurf to turn information into lasting knowledge.
                    </p>
                </div>
                <Testimonials />
            </div>
            <Footer />
          </main>
        </>
    )
}
