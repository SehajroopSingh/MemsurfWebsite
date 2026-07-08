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
      <main className="min-h-screen flex flex-col bg-app-canvas">
        <Navigation variant="youlearn" />
        <section className="flex-1 pt-36 pb-20 sm:pt-44 sm:pb-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-5xl font-bold leading-tight tracking-normal text-app-text sm:text-6xl">
                About MemSurf
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-app-textMuted sm:text-xl">
                MemSurf turns the information you already care about into structured practice that helps it stick.
              </p>
            </div>

            <div className="mt-12 grid gap-4">
              <section className="rounded-[28px] border border-app-border bg-app-surface p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-app-text">
                  Our Mission
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-app-textMuted">
                  Our mission is to make high-quality, active learning accessible to everyone, from students and professionals to lifelong learners. We&apos;re building tools that fit naturally into your existing workflows so you can learn faster and remember more.
                </p>
              </section>

              <section className="rounded-[28px] border border-app-border bg-app-surface p-6 sm:p-8">
                <h2 className="text-2xl font-semibold tracking-tight text-app-text">
                  How It Works
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-app-textMuted">
                  MemSurf uses AI to process your content, extract key concepts, generate interactive quizzes, and schedule reviews at the optimal time, right before you would forget. This approach turns passive consumption into durable mastery.
                </p>
              </section>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  )
}
