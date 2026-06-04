import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About MemSurf – AI-Powered Adaptive Learning Platform',
  description: 'Learn about MemSurf, an adaptive learning platform that turns any content into interactive quizzes and helps you master knowledge with spaced repetition.',
  alternates: {
    canonical: 'https://memsurf.com/about',
  },
  openGraph: {
    title: 'About MemSurf',
    description: 'Learn about MemSurf, the AI-powered learning platform that helps you make knowledge stick.',
    url: 'https://memsurf.com/about',
  },
}

export default function AboutPage() {
  const pageUrl = 'https://memsurf.com/about'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About MemSurf',
    description: 'Learn about MemSurf, an adaptive learning platform that turns any content into interactive quizzes and helps you master knowledge with spaced repetition.',
    url: pageUrl,
    isPartOf: { '@id': 'https://memsurf.com/#website' },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen flex flex-col">
        <Navigation />
        <section className="flex-1 pt-24 pb-16 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-app-text mb-6">
              About MemSurf
            </h1>
          <p className="text-app-textMuted text-lg mb-4">
            MemSurf is an adaptive learning platform that helps you turn any content
            into interactive quizzes, and master knowledge with spaced repetition.
          </p>
          <h2 className="text-2xl font-semibold text-app-text mt-10 mb-4">
            Our Mission
          </h2>
          <p className="text-app-textMuted text-lg mb-4">
            Our mission is to make high-quality, active learning accessible to everyone—
            from students and professionals to lifelong learners. We&apos;re building tools
            that fit naturally into your existing workflows so you can learn faster and
            remember more.
          </p>
          <h2 className="text-2xl font-semibold text-app-text mt-8 mb-3">
            How It Works
          </h2>
          <p className="text-app-textMuted text-lg">
            MemSurf uses AI to process your content, extract key concepts, generate 
            interactive quizzes, and schedule reviews at the optimal time — right before 
            you would forget. This approach, grounded in cognitive science, turns passive 
            consumption into durable mastery.
          </p>
        </div>
      </section>
        <Footer />
      </main>
    </>
  )
}
